'use client';

import { Plus, X } from 'lucide-react';
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
import { FieldFilterRow } from './field-filter-row';
import type { FilterConfig, FilterValue } from './types';

interface RelationFilterCardProps {
  relationFields: FilterConfig[];
  value?: {
    field: string;
    operator: 'some' | 'every' | 'none';
    conditions: FilterValue[];
  };
  onChange: (value: any) => void;
  onRemove: () => void;
  getRelationFields: (modelName: string) => Promise<FilterConfig[]>;
}

export function RelationFilterCard({
  relationFields,
  value,
  onChange,
  onRemove,
  getRelationFields,
}: RelationFilterCardProps) {
  const [selectedRelation, setSelectedRelation] = useState<string>(
    value?.field || ''
  );
  const [operator, setOperator] = useState<'some' | 'every' | 'none'>(
    value?.operator || 'some'
  );
  const [nestedFields, setNestedFields] = useState<FilterConfig[]>([]);
  const [conditions, setConditions] = useState<FilterValue[]>(
    value?.conditions || []
  );

  // Load nested fields when relation is selected
  useEffect(() => {
    if (selectedRelation) {
      const relationField = relationFields.find(
        (f) => f.field === selectedRelation
      );
      if (relationField?.relationTo) {
        getRelationFields(relationField.relationTo).then(setNestedFields);
      }
    }
  }, [selectedRelation, relationFields, getRelationFields]);

  // Helper to notify parent of changes
  const notifyChange = (
    relation: string = selectedRelation,
    op: 'some' | 'every' | 'none' = operator,
    conds: FilterValue[] = conditions
  ) => {
    if (relation && conds.length > 0) {
      onChange({
        field: relation,
        operator: op,
        conditions: conds,
      });
    }
  };

  const handleRelationChange = (relation: string) => {
    setSelectedRelation(relation);
    setConditions([]); // Reset conditions when relation changes
    setNestedFields([]); // Reset nested fields
    // Don't notify change here as conditions are empty
  };

  const handleOperatorChange = (newOperator: 'some' | 'every' | 'none') => {
    setOperator(newOperator);
    if (selectedRelation && conditions.length > 0) {
      notifyChange(selectedRelation, newOperator, conditions);
    }
  };

  const addCondition = () => {
    setConditions([
      ...conditions,
      {
        id: Math.random().toString(36).substring(2, 11),
        field: '',
        operator: 'equals',
        value: '',
        type: 'String',
      } as any,
    ]);
  };

  const updateCondition = (index: number, condition: FilterValue | null) => {
    let newConditions: FilterValue[];
    if (condition === null) {
      newConditions = conditions.filter((_, i) => i !== index);
    } else {
      newConditions = [...conditions];
      newConditions[index] = condition;
    }
    setConditions(newConditions);

    if (selectedRelation && newConditions.length > 0) {
      notifyChange(selectedRelation, operator, newConditions);
    }
  };

  const removeCondition = (index: number) => {
    const newConditions = conditions.filter((_, i) => i !== index);
    setConditions(newConditions);

    if (selectedRelation && newConditions.length > 0) {
      notifyChange(selectedRelation, operator, newConditions);
    }
  };

  const relationField = relationFields.find(
    (f) => f.field === selectedRelation
  );
  const isSingleRelation = relationField && !relationField.list;
  const operatorOptions = isSingleRelation
    ? [
        { value: 'is' as const, label: 'Is' },
        { value: 'isNot' as const, label: 'Is not' },
      ]
    : [
        { value: 'some' as const, label: 'At least one item matches' },
        { value: 'every' as const, label: 'All items match' },
        { value: 'none' as const, label: 'No items match' },
      ];

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Select
              onValueChange={handleRelationChange}
              value={selectedRelation}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select relation" />
              </SelectTrigger>
              <SelectContent>
                {relationFields.map((field) => (
                  <SelectItem key={field.field} value={field.field}>
                    {field.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <Select
              disabled={!selectedRelation}
              onValueChange={handleOperatorChange}
              value={operator}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {operatorOptions.map((op) => (
                  <SelectItem key={op.value} value={op.value}>
                    {op.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={onRemove} size="icon" variant="ghost">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {selectedRelation && nestedFields.length > 0 && (
          <div className="ml-4 space-y-3 border-muted border-l-2 pl-4">
            {conditions.map((condition: any, index) => (
              <FieldFilterRow
                fields={nestedFields}
                key={condition.id || `condition-${index}`}
                onChange={(val) => updateCondition(index, val)}
                onRemove={() => removeCondition(index)}
                value={condition}
              />
            ))}

            <Button
              className="w-full"
              onClick={addCondition}
              size="sm"
              variant="outline"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Condition
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
