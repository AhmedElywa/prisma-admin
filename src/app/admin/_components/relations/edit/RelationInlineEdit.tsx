'use client';

import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import type { AdminField } from '@/lib/admin/types';

interface RelationInlineEditProps {
  name: string;
  label: string;
  value?: any;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  relatedModel: string;
  field: AdminField;
}

export function RelationInlineEdit({
  name,
  label,
  value,
  required,
  disabled,
  relatedModel,
  field,
}: RelationInlineEditProps) {
  const [selectedValue, setSelectedValue] = useState<any>(value);

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

    // Try each display field in order
    for (const field of displayFields) {
      if (record[field]) {
        return String(record[field]);
      }
    }

    // Fallback to ID
    return record.id?.toString() || '';
  }

  function handleCreateNew() {}

  function handleRemove() {
    setSelectedValue(null);
  }

  const isOneToOne = !field.list;

  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </Label>

      {isOneToOne && selectedValue ? (
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="font-medium text-sm">
                {getDisplayValue(selectedValue)}
              </p>
              <p className="text-muted-foreground text-xs">
                {relatedModel} #{selectedValue.id}
              </p>
            </div>
            {!disabled && (
              <Button
                onClick={handleRemove}
                size="sm"
                type="button"
                variant="ghost"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="rounded-lg border-2 border-dashed p-4 text-center">
          <p className="mb-2 text-muted-foreground text-sm">
            No {relatedModel.toLowerCase()} connected
          </p>
          {!disabled && (
            <Button
              onClick={handleCreateNew}
              size="sm"
              type="button"
              variant="outline"
            >
              <Plus className="mr-1 h-4 w-4" />
              Create New
            </Button>
          )}
        </div>
      )}

      {/* Hidden input for form submission */}
      <input
        name={name}
        required={required}
        type="hidden"
        value={selectedValue?.id || ''}
      />

      {/* Note for future implementation */}
      <p className="text-muted-foreground text-xs">
        Inline editing coming soon. Use select or autocomplete mode for now.
      </p>
    </div>
  );
}
