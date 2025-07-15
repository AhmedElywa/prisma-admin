'use client';

import { Input } from '@/components/ui/input';

interface DatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function DatePicker({ value, onChange, placeholder }: DatePickerProps) {
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
      className="w-full"
      onChange={(e) => {
        if (e.target.value) {
          onChange(new Date(e.target.value).toISOString());
        } else {
          onChange('');
        }
      }}
      placeholder={placeholder}
      type="datetime-local"
      value={formatDateForInput(value)}
    />
  );
}
