'use client';

import { Textarea } from '@/components/ui/textarea';

interface MultiInputProps {
  value?: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  type?: 'text' | 'number';
}

export function MultiInput({
  value,
  onChange,
  placeholder,
  type = 'text',
}: MultiInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const values = e.target.value
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v);

    if (type === 'number') {
      const numValues = values
        .map((v) => Number(v))
        .filter((v) => !Number.isNaN(v))
        .map((v) => v.toString());
      onChange(numValues);
    } else {
      onChange(values);
    }
  };

  return (
    <Textarea
      className="min-h-[80px] w-full"
      onChange={handleChange}
      placeholder={placeholder || 'Enter values separated by commas'}
      value={Array.isArray(value) ? value.join(', ') : ''}
    />
  );
}
