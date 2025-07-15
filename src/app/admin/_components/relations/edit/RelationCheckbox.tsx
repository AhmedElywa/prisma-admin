'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { AdminField } from '@/lib/admin/types';

interface RelationCheckboxProps {
  name: string;
  label: string;
  value?: any[];
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  relatedModel: string;
  field: AdminField;
}

export function RelationCheckbox({
  name,
  label,
  value = [],
  required,
  disabled,
  relatedModel,
  field,
}: RelationCheckboxProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Get display fields from relation options
  const displayFields = field.relationEditOptions?.previewFields || [
    'id',
    'name',
    'title',
  ];
  const pageSize = field.relationEditOptions?.pageSize || 100; // Load more for checkbox list

  // Initialize selected items from value
  useEffect(() => {
    if (value && Array.isArray(value)) {
      const ids = value
        .map((item) =>
          typeof item === 'object' ? item.id?.toString() : item?.toString()
        )
        .filter(Boolean);
      setSelectedIds(new Set(ids));
    }
  }, [value]);

  // Load all options on mount
  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  async function loadOptions() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        model: relatedModel,
        page: '1',
        perPage: pageSize.toString(),
      });

      const response = await fetch(`/api/admin/data?${params}`);
      if (response.ok) {
        const data = await response.json();
        setOptions(data.data || []);
      }
    } catch (_error) {
    } finally {
      setLoading(false);
    }
  }

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

  function handleToggle(optionId: string) {
    const newSelected = new Set(selectedIds);

    if (newSelected.has(optionId)) {
      newSelected.delete(optionId);
    } else {
      newSelected.add(optionId);
    }

    setSelectedIds(newSelected);
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="ml-2 text-muted-foreground text-sm">
            Loading options...
          </span>
        </div>
      </div>
    );
  }

  if (options.length === 0) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <p className="text-muted-foreground text-sm">No options available</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </Label>

      <div className="max-h-[300px] space-y-2 overflow-y-auto rounded-md border p-3">
        {options.map((option) => {
          const optionId = option.id?.toString() || '';
          const display = getDisplayValue(option);
          const isChecked = selectedIds.has(optionId);

          return (
            <div className="flex items-center space-x-2" key={optionId}>
              <Checkbox
                checked={isChecked}
                disabled={disabled}
                id={`${name}-${optionId}`}
                onCheckedChange={() => handleToggle(optionId)}
              />
              <Label
                className="cursor-pointer font-normal text-sm"
                htmlFor={`${name}-${optionId}`}
              >
                {display}
              </Label>
            </div>
          );
        })}
      </div>

      {/* Hidden inputs for form submission */}
      {Array.from(selectedIds).map((id) => (
        <input key={id} name={`${name}[]`} type="hidden" value={id} />
      ))}

      {/* Empty input for when no items selected */}
      {selectedIds.size === 0 && (
        <input name={`${name}[]`} type="hidden" value="" />
      )}
    </div>
  );
}
