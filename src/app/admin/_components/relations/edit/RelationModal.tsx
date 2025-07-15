'use client';

import { Edit } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { AdminField } from '@/lib/admin/types';

interface RelationModalProps {
  name: string;
  label: string;
  value?: any;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  relatedModel: string;
  field: AdminField;
  modelId?: string;
  modelName?: string;
}

export function RelationModal({
  name,
  label,
  value,
  required,
  disabled,
  placeholder,
  relatedModel,
  field,
}: RelationModalProps) {
  const [selectedValue, _setSelectedValue] = useState<any>(value);

  // Get display fields from relation options
  const displayFields = field.relationEditOptions?.previewFields || [
    'id',
    'name',
    'title',
  ];

  function getDisplayValue(record: any): string {
    if (!record) {
      return '';
    }

    if (Array.isArray(record)) {
      return `${record.length} items selected`;
    }

    // Try each display field in order
    for (const field of displayFields) {
      if (record[field]) {
        return String(record[field]);
      }
    }

    // Fallback to ID
    return record.id?.toString() || '';
  }

  function handleOpenModal() {}

  const displayValue = selectedValue ? getDisplayValue(selectedValue) : '';

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </Label>

      <div className="flex items-center gap-2">
        {displayValue ? (
          <Badge className="max-w-[300px] truncate" variant="secondary">
            {displayValue}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-sm">
            {placeholder || 'No selection'}
          </span>
        )}

        <Button
          disabled={disabled}
          onClick={handleOpenModal}
          size="sm"
          type="button"
          variant="outline"
        >
          <Edit className="mr-1 h-4 w-4" />
          {displayValue ? 'Change' : 'Select'}
        </Button>
      </div>

      {/* Hidden input for form submission */}
      <input
        name={name}
        required={required}
        type="hidden"
        value={
          selectedValue
            ? Array.isArray(selectedValue)
              ? selectedValue.map((v) => v.id).join(',')
              : selectedValue.id || ''
            : ''
        }
      />

      {/* Note for future implementation */}
      <p className="text-muted-foreground text-xs">
        Modal selection coming soon. Use tags or dual list mode for now.
      </p>
    </div>
  );
}
