'use client';

import { ChevronDown, ChevronRight, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FilterGroup } from './filter-group';
import type { FilterConfig, FilterOperator, FilterValue } from './types';

interface RelationFilterProps {
  config: FilterConfig;
  value?: FilterValue;
  onChange: (value: FilterValue | null) => void;
  getRelationFields: (modelName: string) => Promise<FilterConfig[]>;
}

export function RelationFilter({
  config,
  value,
  onChange,
  getRelationFields,
}: RelationFilterProps) {
  const [operator, setOperator] = useState<FilterOperator>(
    value?.operator || 'is'
  );
  const [isExpanded, setIsExpanded] = useState(false);
  const [relationFields, setRelationFields] = useState<FilterConfig[]>([]);
  const [nestedFilters, setNestedFilters] = useState<FilterValue[]>(
    value?.value?.filters || []
  );

  // Load relation fields when expanded
  useEffect(() => {
    if (isExpanded && config.relationTo && relationFields.length === 0) {
      getRelationFields(config.relationTo).then(setRelationFields);
    }
  }, [isExpanded, config.relationTo, relationFields.length, getRelationFields]);

  const isSingleRelation = !config.list;
  const operators: FilterOperator[] = isSingleRelation
    ? ['is', 'isNot']
    : ['every', 'some', 'none'];

  const handleOperatorChange = (newOperator: FilterOperator) => {
    setOperator(newOperator);
  };

  const handleNestedFiltersChange = (filters: FilterValue[]) => {
    setNestedFilters(filters);
  };

  const handleApply = () => {
    if (nestedFilters.length === 0) {
      onChange(null);
      return;
    }

    // Build the nested filter structure
    const nestedWhere = nestedFilters.reduce((acc, filter) => {
      if (filter.operator === 'isNull') {
        acc[filter.field] = null;
      } else if (filter.operator === 'isNotNull') {
        acc[filter.field] = { not: null };
      } else {
        acc[filter.field] = { [filter.operator]: filter.value };
      }
      return acc;
    }, {} as any);

    onChange({
      field: config.field,
      operator,
      value: nestedWhere,
      type: 'relation',
    });
  };

  const handleClear = () => {
    setOperator(isSingleRelation ? 'is' : 'every');
    setNestedFilters([]);
    setIsExpanded(false);
    onChange(null);
  };

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <button
            className="flex items-center gap-2 font-medium text-sm hover:text-primary"
            onClick={() => setIsExpanded(!isExpanded)}
            type="button"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            {config.label}
          </button>
          <Button
            className="h-6 w-6"
            onClick={handleClear}
            size="icon"
            variant="ghost"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        <Select onValueChange={handleOperatorChange} value={operator}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {operators.map((op) => (
              <SelectItem key={op} value={op}>
                {op === 'is'
                  ? 'Where'
                  : op === 'isNot'
                    ? 'Where not'
                    : op === 'every'
                      ? 'All items match'
                      : op === 'some'
                        ? 'At least one item matches'
                        : 'No items match'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isExpanded && (
          <div className="ml-4 space-y-2 border-l-2 pl-4">
            <FilterGroup
              fields={relationFields}
              filters={nestedFilters}
              getRelationFields={getRelationFields}
              onChange={handleNestedFiltersChange}
            />

            {nestedFilters.length > 0 && (
              <Button className="w-full" onClick={handleApply} size="sm">
                Apply Relation Filter
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
