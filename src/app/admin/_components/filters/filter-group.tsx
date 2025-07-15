'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BooleanFilter } from './boolean-filter';
import { DateTimeFilter } from './datetime-filter';
import { EnumFilter } from './enum-filter';
import { JsonFilter } from './json-filter';
import { NumberFilter } from './number-filter';
import { RelationFilter } from './relation-filter';
import { StringFilter } from './string-filter';
import type { FilterConfig, FilterValue } from './types';

interface FilterGroupProps {
  fields: FilterConfig[];
  filters: FilterValue[];
  onChange: (filters: FilterValue[]) => void;
  getRelationFields?: (modelName: string) => Promise<FilterConfig[]>;
}

export function FilterGroup({
  fields,
  filters,
  onChange,
  getRelationFields,
}: FilterGroupProps) {
  const [selectedField, setSelectedField] = useState<string>('');

  const availableFields = fields.filter(
    (field) => !filters.some((f) => f.field === field.field)
  );

  const handleAddFilter = () => {
    if (selectedField) {
      const field = fields.find((f) => f.field === selectedField);
      if (field) {
        onChange([
          ...filters,
          {
            field: field.field,
            operator: 'equals',
            value: '',
            type: field.type,
          },
        ]);
        setSelectedField('');
      }
    }
  };

  const handleFilterChange = (index: number, value: FilterValue | null) => {
    if (value === null) {
      // Remove filter
      onChange(filters.filter((_, i) => i !== index));
    } else {
      // Update filter
      const newFilters = [...filters];
      newFilters[index] = value;
      onChange(newFilters);
    }
  };

  const renderFilter = (
    config: FilterConfig,
    value: FilterValue,
    index: number
  ) => {
    const props = {
      config,
      value,
      onChange: (val: FilterValue | null) => handleFilterChange(index, val),
    };

    if (config.kind === 'object' && getRelationFields) {
      return (
        <RelationFilter {...props} getRelationFields={getRelationFields} />
      );
    }

    if (config.kind === 'enum') {
      return <EnumFilter {...props} />;
    }

    switch (config.type) {
      case 'String':
        return <StringFilter {...props} />;
      case 'Int':
      case 'BigInt':
      case 'Float':
      case 'Decimal':
        return <NumberFilter {...props} />;
      case 'Boolean':
        return <BooleanFilter {...props} />;
      case 'DateTime':
        return <DateTimeFilter {...props} />;
      case 'Json':
        return <JsonFilter {...props} />;
      default:
        return <StringFilter {...props} />;
    }
  };

  return (
    <div className="space-y-4">
      {filters.length === 0 && (
        <div className="py-8 text-center text-muted-foreground">
          <p className="text-sm">No filters applied</p>
          <p className="mt-1 text-xs">Select a field below to add a filter</p>
        </div>
      )}

      {filters.map((filter, index) => {
        const field = fields.find((f) => f.field === filter.field);
        if (!field) {
          return null;
        }

        return (
          <div key={`${filter.field}-${index}`}>
            {renderFilter(field, filter, index)}
          </div>
        );
      })}

      {availableFields.length > 0 && (
        <div className="pt-2">
          <div className="flex gap-2">
            <Select onValueChange={setSelectedField} value={selectedField}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a field to filter" />
              </SelectTrigger>
              <SelectContent>
                {availableFields.map((field) => (
                  <SelectItem key={field.field} value={field.field}>
                    {field.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              disabled={!selectedField}
              onClick={handleAddFilter}
              size="icon"
              variant="secondary"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
