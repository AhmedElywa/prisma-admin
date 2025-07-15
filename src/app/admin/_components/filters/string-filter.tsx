'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BaseFilter } from './base-filter';
import {
  type FilterConfig,
  type FilterOperator,
  type FilterValue,
  isMultiValue,
} from './types';

interface StringFilterProps {
  config: FilterConfig;
  value?: FilterValue;
  onChange: (value: FilterValue | null) => void;
}

export function StringFilter({ config, value, onChange }: StringFilterProps) {
  // Always use case insensitive mode
  const mode = 'insensitive';

  const renderInput = (
    operator: FilterOperator,
    value: any,
    onChange: (value: any) => void
  ) => {
    if (isMultiValue(operator)) {
      return (
        <Textarea
          className="min-h-[80px]"
          onChange={(e) => {
            const values = e.target.value
              .split(',')
              .map((v) => v.trim())
              .filter((v) => v);
            onChange(values);
          }}
          placeholder="Enter values separated by commas"
          value={Array.isArray(value) ? value.join(', ') : value}
        />
      );
    }

    return (
      <Input
        className="w-full"
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Enter ${config.label.toLowerCase()}`}
        type="text"
        value={value || ''}
      />
    );
  };

  const handleChange = (val: FilterValue | null) => {
    if (val && ['contains', 'startsWith', 'endsWith'].includes(val.operator)) {
      onChange({ ...val, mode });
    } else {
      onChange(val);
    }
  };

  return (
    <BaseFilter
      config={config}
      onChange={handleChange}
      renderInput={renderInput}
      value={value}
    />
  );
}
