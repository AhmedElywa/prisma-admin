'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { DatePicker } from './date-picker';
import { MultiInput } from './multi-input';
import {
  type FilterConfig,
  type FilterOperator,
  type FilterValue,
  getOperatorLabel,
  getOperatorsForType,
  isMultiValue,
  needsValue,
} from './types';

interface FieldFilterRowProps {
  fields: FilterConfig[];
  value?: Partial<FilterValue>;
  onChange: (value: FilterValue | null) => void;
  onRemove: () => void;
}

export function FieldFilterRow({
  fields,
  value,
  onChange,
  onRemove,
}: FieldFilterRowProps) {
  const [selectedField, setSelectedField] = useState<string>(
    value?.field || ''
  );
  const [operator, setOperator] = useState<FilterOperator>(
    value?.operator || 'equals'
  );
  const [filterValue, setFilterValue] = useState<any>(value?.value ?? '');

  const fieldConfig = fields.find((f) => f.field === selectedField);
  const operators = fieldConfig
    ? getOperatorsForType(fieldConfig.type, fieldConfig.kind)
    : [];
  const showValue = needsValue(operator);
  const isMulti = isMultiValue(operator);

  const handleOperatorChange = (newOperator: FilterOperator) => {
    setOperator(newOperator);

    // For operators that don't need values, update immediately
    if (!needsValue(newOperator) && fieldConfig) {
      onChange({
        field: fieldConfig.field,
        operator: newOperator,
        value: null,
        type: fieldConfig.type,
      });
    } else if (fieldConfig && filterValue) {
      // If we have a value, update with the new operator
      onChange({
        field: fieldConfig.field,
        operator: newOperator,
        value: filterValue,
        type: fieldConfig.type,
      });
    }
  };

  const handleValueChange = (newValue: any) => {
    setFilterValue(newValue);

    if (fieldConfig && operator) {
      onChange({
        field: fieldConfig.field,
        operator,
        value: newValue,
        type: fieldConfig.type,
      });
    }
  };

  const handleFieldChange = (field: string) => {
    setSelectedField(field);
    const newFieldConfig = fields.find((f) => f.field === field);
    if (newFieldConfig) {
      const newOperators = getOperatorsForType(
        newFieldConfig.type,
        newFieldConfig.kind
      );
      if (!newOperators.includes(operator)) {
        setOperator(newOperators[0] || 'equals');
      }
      setFilterValue('');
    }
  };

  const renderValueInput = () => {
    if (!(fieldConfig && showValue)) {
      return null;
    }

    // Multi-value inputs
    if (isMulti) {
      return (
        <MultiInput
          onChange={handleValueChange}
          placeholder={`Enter ${fieldConfig.label.toLowerCase()} values`}
          type={fieldConfig.type === 'String' ? 'text' : 'number'}
          value={filterValue}
        />
      );
    }

    // Boolean
    if (fieldConfig.type === 'Boolean') {
      return (
        <Switch
          checked={filterValue === true || filterValue === 'true'}
          onCheckedChange={handleValueChange}
        />
      );
    }

    // Enum
    if (fieldConfig.kind === 'enum' && fieldConfig.enumValues) {
      return (
        <Select onValueChange={handleValueChange} value={filterValue}>
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder={`Select ${fieldConfig.label.toLowerCase()}`}
            />
          </SelectTrigger>
          <SelectContent>
            {fieldConfig.enumValues.map((enumValue) => (
              <SelectItem key={enumValue} value={enumValue}>
                {enumValue}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // DateTime
    if (fieldConfig.type === 'DateTime') {
      return (
        <DatePicker
          onChange={handleValueChange}
          placeholder={`Select ${fieldConfig.label.toLowerCase()}`}
          value={filterValue}
        />
      );
    }

    // Number types
    if (['Int', 'BigInt', 'Float', 'Decimal'].includes(fieldConfig.type)) {
      return (
        <Input
          className="w-full"
          onChange={(e) => {
            const val = e.target.value;
            if (val === '') {
              handleValueChange('');
            } else {
              const num = Number(val);
              if (!Number.isNaN(num)) {
                handleValueChange(num);
              }
            }
          }}
          placeholder={`Enter ${fieldConfig.label.toLowerCase()}`}
          type="number"
          value={filterValue}
        />
      );
    }

    // String and others
    return (
      <Input
        className="w-full"
        onChange={(e) => handleValueChange(e.target.value)}
        placeholder={`Enter ${fieldConfig.label.toLowerCase()}`}
        type="text"
        value={filterValue}
      />
    );
  };

  return (
    <div className="grid grid-cols-12 items-center gap-3">
      <div className="col-span-3">
        <Select onValueChange={handleFieldChange} value={selectedField}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select field" />
          </SelectTrigger>
          <SelectContent>
            {fields.map((field) => (
              <SelectItem key={field.field} value={field.field}>
                {field.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="col-span-3">
        <Select
          disabled={!selectedField}
          onValueChange={handleOperatorChange}
          value={operator}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select operator" />
          </SelectTrigger>
          <SelectContent>
            {operators.map((op) => (
              <SelectItem key={op} value={op}>
                {getOperatorLabel(op)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="col-span-5">
        {showValue ? (
          renderValueInput()
        ) : (
          <div className="text-muted-foreground text-sm">No value needed</div>
        )}
      </div>

      <div className="col-span-1">
        <Button onClick={onRemove} size="icon" variant="ghost">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
