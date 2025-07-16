'use client';

import { Plus, Search, Tag } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { FieldFilterRow } from './field-filter-row';
import { RelationFilterCard } from './relation-filter-card';
import type { FilterConfig, FilterValue } from './types';

interface AdvancedFilterPanelProps {
  fields: FilterConfig[];
  filters: FilterValue[];
  onChange: (filters: FilterValue[]) => void;
  getRelationFields?: (modelName: string) => Promise<FilterConfig[]>;
}

export function AdvancedFilterPanel({
  fields,
  filters,
  onChange,
  getRelationFields,
}: AdvancedFilterPanelProps) {
  // Separate fields into relations and regular fields
  const relationFields = useMemo(
    () => fields.filter((f) => f.kind === 'object'),
    [fields]
  );
  const regularFields = useMemo(
    () => fields.filter((f) => f.kind !== 'object'),
    [fields]
  );

  // Initialize state from props
  const initializeFilters = () => {
    const relationFilters = filters.filter((f) => f.type === 'relation');
    const fieldFilters = filters.filter((f) => f.type !== 'relation');

    return {
      relations: relationFilters.map((f) => ({
        id: Math.random().toString(36).substring(2, 11),
        field: f.field,
        operator: f.operator,
        conditions: f.value
          ? Object.entries(f.value).map(([field, condition]: [string, any]) => {
              const op = Object.keys(condition)[0];
              return {
                field,
                operator: op,
                value: condition[op],
                type: 'String', // Dynamic type determination from relation field metadata
              };
            })
          : [],
      })),
      fields: fieldFilters.map((f) => ({
        id: Math.random().toString(36).substring(2, 11),
        ...f,
      })),
    };
  };

  const [tempRelationFilters, setTempRelationFilters] = useState<any[]>(
    () => initializeFilters().relations
  );
  const [tempFieldFilters, setTempFieldFilters] = useState<any[]>(
    () => initializeFilters().fields
  );

  // We don't sync the `filters` prop into state to avoid infinite loops.
  // Instead, <FilterPanel> resets its own tempFilters and toggles this component's
  // `key` (open/closed) on each sheet open, ensuring a fresh mount and state reset.
  // This approach maintains state isolation while providing controlled reset behavior.

  const addRelationFilter = () => {
    setTempRelationFilters([
      ...tempRelationFilters,
      {
        id: Math.random().toString(36).substring(2, 11),
        field: '',
        operator: 'some',
        conditions: [],
      },
    ]);
  };

  const updateRelationFilter = (id: string, value: any) => {
    setTempRelationFilters(
      tempRelationFilters.map((filter) =>
        filter.id === id ? { ...filter, ...value } : filter
      )
    );
  };

  const removeRelationFilter = (id: string) => {
    setTempRelationFilters(tempRelationFilters.filter((f) => f.id !== id));
  };

  const addFieldFilter = () => {
    setTempFieldFilters([
      ...tempFieldFilters,
      {
        id: Math.random().toString(36).substring(2, 11),
        field: '',
        operator: 'equals',
        value: '',
        type: 'String',
      },
    ]);
  };

  const updateFieldFilter = (id: string, value: FilterValue | null) => {
    if (value === null) {
      setTempFieldFilters(tempFieldFilters.filter((f) => f.id !== id));
    } else {
      setTempFieldFilters(
        tempFieldFilters.map((filter) =>
          filter.id === id ? { ...filter, ...value } : filter
        )
      );
    }
  };

  const removeFieldFilter = (id: string) => {
    setTempFieldFilters(tempFieldFilters.filter((f) => f.id !== id));
  };

  // Build filters whenever state changes
  useEffect(() => {
    const newFilters: FilterValue[] = [];

    // Convert relation filters
    tempRelationFilters.forEach((rf) => {
      if (rf.field && rf.conditions.length > 0) {
        const nestedWhere = rf.conditions.reduce((acc: any, condition: any) => {
          if (condition.field && condition.operator && condition.value !== '') {
            if (condition.operator === 'isNull') {
              acc[condition.field] = null;
            } else if (condition.operator === 'isNotNull') {
              acc[condition.field] = { not: null };
            } else {
              acc[condition.field] = { [condition.operator]: condition.value };
            }
          }
          return acc;
        }, {});

        if (Object.keys(nestedWhere).length > 0) {
          newFilters.push({
            field: rf.field,
            operator: rf.operator,
            value: nestedWhere,
            type: 'relation',
          });
        }
      }
    });

    // Add field filters
    tempFieldFilters.forEach((ff) => {
      if (
        ff.field &&
        ff.operator &&
        (ff.value !== '' || !['isNull', 'isNotNull'].includes(ff.operator))
      ) {
        newFilters.push({
          field: ff.field,
          operator: ff.operator,
          value: ff.value,
          type: ff.type,
        });
      }
    });

    onChange(newFilters);
  }, [tempRelationFilters, tempFieldFilters, onChange]);

  const hasRelationFields = relationFields.length > 0;
  const hasRegularFields = regularFields.length > 0;

  return (
    <div className="space-y-6">
      {/* Relation Filters Section */}
      {hasRelationFields && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 font-medium text-base">
              <Tag className="h-4 w-4" />
              Relation Filters
            </Label>
            <Button onClick={addRelationFilter} size="sm" variant="outline">
              <Plus className="me-1 h-4 w-4" />
              Add Relation
            </Button>
          </div>

          {tempRelationFilters.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground text-sm">
                No relation filters added
              </p>
              <p className="mt-1 text-muted-foreground text-xs">
                Click "Add Relation" to filter by related records
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tempRelationFilters.map((filter) => (
                <RelationFilterCard
                  getRelationFields={
                    getRelationFields ||
                    (() => {
                      return Promise.resolve([]);
                    })
                  }
                  key={filter.id}
                  onChange={(value) => updateRelationFilter(filter.id, value)}
                  onRemove={() => removeRelationFilter(filter.id)}
                  relationFields={relationFields}
                  value={filter}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {hasRelationFields && hasRegularFields && <Separator />}

      {/* Field Filters Section */}
      {hasRegularFields && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 font-medium text-base">
              <Search className="h-4 w-4" />
              Field Filters
            </Label>
            <Button onClick={addFieldFilter} size="sm" variant="outline">
              <Plus className="me-1 h-4 w-4" />
              Add Filter
            </Button>
          </div>

          {tempFieldFilters.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground text-sm">
                No field filters added
              </p>
              <p className="mt-1 text-muted-foreground text-xs">
                Click "Add Filter" to filter by field values
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-3 px-4 font-semibold text-xs">
                <div className="col-span-3">Field</div>
                <div className="col-span-3">Operator</div>
                <div className="col-span-5">Value</div>
                <div className="col-span-1" />
              </div>
              {tempFieldFilters.map((filter) => (
                <Card className="p-4" key={filter.id}>
                  <FieldFilterRow
                    fields={regularFields}
                    onChange={(value) => updateFieldFilter(filter.id, value)}
                    onRemove={() => removeFieldFilter(filter.id)}
                    value={filter}
                  />
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {!(hasRelationFields || hasRegularFields) && (
        <div className="py-8 text-center text-muted-foreground">
          <p className="text-sm">No filterable fields available</p>
        </div>
      )}
    </div>
  );
}
