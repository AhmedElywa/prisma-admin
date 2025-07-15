'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BaseFilter } from './base-filter';
import type { FilterConfig, FilterOperator, FilterValue } from './types';

interface JsonFilterProps {
  config: FilterConfig;
  value?: FilterValue;
  onChange: (value: FilterValue | null) => void;
}

export function JsonFilter({ config, value, onChange }: JsonFilterProps) {
  const renderInput = (
    operator: FilterOperator,
    value: any,
    onChange: (value: any) => void
  ) => {
    // For JSON string operations
    if (operator.startsWith('string_')) {
      return (
        <Input
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter text to search in JSON"
          type="text"
          value={value || ''}
        />
      );
    }

    // For array operations or equals/not
    if (
      operator.startsWith('array_') ||
      operator === 'equals' ||
      operator === 'not'
    ) {
      return (
        <Textarea
          className="min-h-[120px] font-mono text-sm"
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              onChange(parsed);
            } catch {
              // Keep as string if invalid JSON
              onChange(e.target.value);
            }
          }}
          placeholder="Enter valid JSON"
          value={
            typeof value === 'string' ? value : JSON.stringify(value, null, 2)
          }
        />
      );
    }

    // For comparison operators (lt, lte, gt, gte)
    return (
      <Input
        onChange={(e) => {
          // Try to parse as number first
          const num = Number(e.target.value);
          if (Number.isNaN(num)) {
            onChange(e.target.value);
          } else {
            onChange(num);
          }
        }}
        placeholder="Enter value for comparison"
        type="text"
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
