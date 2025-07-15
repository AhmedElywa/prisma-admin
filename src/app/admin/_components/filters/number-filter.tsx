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

interface NumberFilterProps {
  config: FilterConfig;
  value?: FilterValue;
  onChange: (value: FilterValue | null) => void;
}

export function NumberFilter({ config, value, onChange }: NumberFilterProps) {
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
              .filter((v) => v && !Number.isNaN(Number(v)))
              .map((v) => {
                if (config.type === 'Float' || config.type === 'Decimal') {
                  return Number.parseFloat(v);
                }
                return Number.parseInt(v, 10);
              });
            onChange(values);
          }}
          placeholder="Enter numbers separated by commas"
          value={Array.isArray(value) ? value.join(', ') : value}
        />
      );
    }

    const inputType =
      config.type === 'Float' || config.type === 'Decimal'
        ? 'number'
        : 'number';
    const step =
      config.type === 'Float' || config.type === 'Decimal' ? '0.01' : '1';

    return (
      <Input
        onChange={(e) => {
          const val = e.target.value;
          if (val === '') {
            onChange('');
          } else if (config.type === 'Float' || config.type === 'Decimal') {
            onChange(Number.parseFloat(val));
          } else {
            onChange(Number.parseInt(val, 10));
          }
        }}
        placeholder={`Enter ${config.label.toLowerCase()}`}
        step={step}
        type={inputType}
        value={value || ''}
      />
    );
  };

  return (
    <BaseFilter
      config={config}
      onChange={onChange}
      renderInput={renderInput}
      value={value}
    />
  );
}
