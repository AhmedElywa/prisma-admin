'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BaseFilter } from './base-filter';
import {
  type FilterConfig,
  type FilterOperator,
  type FilterValue,
  isMultiValue,
} from './types';

interface EnumFilterProps {
  config: FilterConfig;
  value?: FilterValue;
  onChange: (value: FilterValue | null) => void;
}

export function EnumFilter({ config, value, onChange }: EnumFilterProps) {
  const renderInput = (
    operator: FilterOperator,
    value: any,
    onChange: (value: any) => void
  ) => {
    if (!config.enumValues || config.enumValues.length === 0) {
      return (
        <div className="text-muted-foreground text-sm">
          No enum values available
        </div>
      );
    }

    if (isMultiValue(operator)) {
      const selectedValues = Array.isArray(value) ? value : [];

      return (
        <div className="max-h-[200px] space-y-2 overflow-y-auto rounded-md border p-3">
          {config.enumValues.map((enumValue) => (
            <div className="flex items-center gap-2" key={enumValue}>
              <Checkbox
                checked={selectedValues.includes(enumValue)}
                id={enumValue}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onChange([...selectedValues, enumValue]);
                  } else {
                    onChange(selectedValues.filter((v) => v !== enumValue));
                  }
                }}
              />
              <Label className="cursor-pointer text-sm" htmlFor={enumValue}>
                {enumValue}
              </Label>
            </div>
          ))}
        </div>
      );
    }

    return (
      <Select onValueChange={onChange} value={value || ''}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select value" />
        </SelectTrigger>
        <SelectContent>
          {config.enumValues.map((enumValue) => (
            <SelectItem key={enumValue} value={enumValue}>
              {enumValue}
            </SelectItem>
          ))}
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
