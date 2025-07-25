'use client';

import { Input } from '@/components/ui/input';

interface DatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function DatePicker({ value, onChange, placeholder }: DatePickerProps) {
  const formatDateForInput = (date: string | Date | null | undefined) => {
    if (!date) {
      return '';
    }
    try {
      const parsedDate = new Date(date);
      if (Number.isNaN(parsedDate.getTime())) {
        return '';
      }
      return parsedDate.toISOString().slice(0, 16);
    } catch {
      return '';
    }
  };

  return (
    <Input
      className="w-full"
      onChange={(e) => {
        if (e.target.value) {
          try {
            const date = new Date(e.target.value);
            if (!Number.isNaN(date.getTime())) {
              onChange(date.toISOString());
            }
          } catch {
            // Invalid date input, ignore
          }
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
