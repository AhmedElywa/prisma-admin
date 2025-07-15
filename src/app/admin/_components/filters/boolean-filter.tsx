'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BaseFilter } from './base-filter';
import type { FilterConfig, FilterOperator, FilterValue } from './types';

interface BooleanFilterProps {
  config: FilterConfig;
  value?: FilterValue;
  onChange: (value: FilterValue | null) => void;
}

export function BooleanFilter({ config, value, onChange }: BooleanFilterProps) {
  const renderInput = (
    _operator: FilterOperator,
    value: any,
    onChange: (value: any) => void
  ) => {
    return (
      <Select
        onValueChange={(val) => onChange(val === 'true')}
        value={value?.toString() || ''}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select value" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="true">True</SelectItem>
          <SelectItem value="false">False</SelectItem>
        </SelectContent>
      </Select>
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
