'use client';

import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  type FilterConfig,
  type FilterOperator,
  type FilterValue,
  getOperatorLabel,
  getOperatorsForType,
  needsValue,
} from './types';

interface BaseFilterProps {
  config: FilterConfig;
  value?: FilterValue;
  onChange: (value: FilterValue | null) => void;
  renderInput: (
    operator: FilterOperator,
    value: any,
    onChange: (value: any) => void
  ) => React.ReactNode;
}

export function BaseFilter({
  config,
  value,
  onChange,
  renderInput,
}: BaseFilterProps) {
  const [operator, setOperator] = useState<FilterOperator>(
    value?.operator || 'equals'
  );
  const [filterValue, setFilterValue] = useState<any>(value?.value ?? '');

  const operators = getOperatorsForType(config.type, config.kind);
  const showValue = needsValue(operator);
  const isFilterReady =
    !showValue ||
    (filterValue !== '' &&
      filterValue !== null &&
      filterValue !== undefined &&
      (!Array.isArray(filterValue) || filterValue.length > 0));

  const handleOperatorChange = (newOperator: FilterOperator) => {
    setOperator(newOperator);

    // For operators that don't need a value, save immediately
    if (!needsValue(newOperator)) {
      onChange({
        field: config.field,
        operator: newOperator,
        value: null,
        type: config.type,
      });
    } else if (
      filterValue !== '' &&
      filterValue !== null &&
      filterValue !== undefined &&
      (!Array.isArray(filterValue) || filterValue.length > 0)
    ) {
      // If we have a value, update with new operator
      onChange({
        field: config.field,
        operator: newOperator,
        value: filterValue,
        type: config.type,
      });
    }
  };

  const handleValueChange = (newValue: any) => {
    setFilterValue(newValue);

    // Save the filter when value changes
    if (
      newValue !== '' &&
      newValue !== null &&
      newValue !== undefined &&
      (!Array.isArray(newValue) || newValue.length > 0)
    ) {
      onChange({
        field: config.field,
        operator,
        value: newValue,
        type: config.type,
      });
    }
  };

  const handleClear = () => {
    setOperator('equals');
    setFilterValue('');
    onChange(null);
  };

  return (
    <div className="relative space-y-3 rounded-lg border bg-muted/30 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-sm">{config.label}</h4>
          {isFilterReady && (
            <Badge className="h-5 px-1.5" variant="secondary">
              <Check className="h-3 w-3" />
            </Badge>
          )}
        </div>
        <Button
          className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
          onClick={handleClear}
          size="icon"
          variant="ghost"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Select onValueChange={handleOperatorChange} value={operator}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {operators.map((op) => (
            <SelectItem key={op} value={op}>
              {getOperatorLabel(op)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showValue && (
        <div className="space-y-2">
          {renderInput(operator, filterValue, handleValueChange)}
        </div>
      )}
    </div>
  );
}
