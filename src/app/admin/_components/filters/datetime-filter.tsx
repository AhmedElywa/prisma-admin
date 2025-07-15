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

interface DateTimeFilterProps {
  config: FilterConfig;
  value?: FilterValue;
  onChange: (value: FilterValue | null) => void;
}

export function DateTimeFilter({
  config,
  value,
  onChange,
}: DateTimeFilterProps) {
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
              .filter((v) => v)
              .map((v) => new Date(v).toISOString());
            onChange(values);
          }}
          placeholder="Enter dates separated by commas (YYYY-MM-DD)"
          value={
            Array.isArray(value)
              ? value
                  .map((v) => new Date(v).toISOString().split('T')[0])
                  .join(', ')
              : value
          }
        />
      );
    }

    // Format date for input
    const formatDateForInput = (date: any) => {
      if (!date) {
        return '';
      }
      try {
        return new Date(date).toISOString().slice(0, 16);
      } catch {
        return '';
      }
    };

    return (
      <Input
        onChange={(e) => {
          if (e.target.value) {
            onChange(new Date(e.target.value).toISOString());
          } else {
            onChange('');
          }
        }}
        type="datetime-local"
        value={formatDateForInput(value)}
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
