'use client';

import { Plus, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { AdminField } from '@/lib/admin/types';
import { cn } from '@/lib/utils';

interface RelationTagInputProps {
  name: string;
  label: string;
  value?: any[];
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  relatedModel: string;
  field: AdminField;
}

export function RelationTagInput({
  name,
  label,
  value = [],
  required,
  disabled,
  placeholder,
  relatedModel,
  field,
}: RelationTagInputProps) {
  const [open, setOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Get display fields from relation options
  const displayFields = field.relationEditOptions?.previewFields || [
    'id',
    'name',
    'title',
  ];
  const searchable = field.relationEditOptions?.searchable !== false;
  const maxDisplay = field.relationEditOptions?.maxDisplay || 5;
  const pageSize = field.relationEditOptions?.pageSize || 50;

  // Initialize selected items from value
  useEffect(() => {
    if (value && Array.isArray(value)) {
      setSelectedItems(value);
    }
  }, [value]);

  const loadOptions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        model: relatedModel,
        page: '1',
        perPage: pageSize.toString(),
      });

      if (search && searchable) {
        params.append('search', search);
      }

      const response = await fetch(`/api/admin/data?${params}`);
      if (response.ok) {
        const data = await response.json();
        setOptions(data.data || []);
      }
    } catch (_error) {
    } finally {
      setLoading(false);
    }
  }, [relatedModel, pageSize, search, searchable]);

  // Load options when dropdown opens or search changes
  useEffect(() => {
    if (open) {
      loadOptions();
    }
  }, [open, loadOptions]);

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

  function handleSelect(option: any) {
    const isSelected = selectedItems.some((item) => item.id === option.id);

    if (isSelected) {
      setSelectedItems(selectedItems.filter((item) => item.id !== option.id));
    } else {
      setSelectedItems([...selectedItems, option]);
    }
  }

  function removeItem(itemToRemove: any) {
    setSelectedItems(
      selectedItems.filter((item) => item.id !== itemToRemove.id)
    );
  }

  const showAll = selectedItems.length <= maxDisplay;
  const visibleItems = showAll
    ? selectedItems
    : selectedItems.slice(0, maxDisplay);
  const hiddenCount = selectedItems.length - visibleItems.length;

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </Label>

      <div className="space-y-2">
        {/* Selected tags */}
        <div className="flex flex-wrap gap-2">
          {visibleItems.map((item) => (
            <Badge key={item.id} variant="secondary">
              {getDisplayValue(item)}
              {!disabled && (
                <button
                  className="ml-1 hover:text-destructive"
                  onClick={() => removeItem(item)}
                  type="button"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
          {hiddenCount > 0 && (
            <Badge variant="outline">+{hiddenCount} more</Badge>
          )}
        </div>

        {/* Add button */}
        {!disabled && (
          <Popover onOpenChange={setOpen} open={open}>
            <PopoverTrigger asChild>
              <Button className="h-8" size="sm" type="button" variant="outline">
                <Plus className="mr-1 h-4 w-4" />
                Add {label}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[300px] p-0">
              <Command>
                {searchable && (
                  <CommandInput
                    onValueChange={setSearch}
                    placeholder={
                      placeholder || `Search ${label.toLowerCase()}...`
                    }
                  />
                )}
                <CommandEmpty>
                  {loading ? 'Loading...' : 'No results found.'}
                </CommandEmpty>
                <CommandGroup className="max-h-[200px] overflow-auto">
                  {options.map((option) => {
                    const isSelected = selectedItems.some(
                      (item) => item.id === option.id
                    );
                    const display = getDisplayValue(option);

                    return (
                      <CommandItem
                        key={option.id}
                        onSelect={() => handleSelect(option)}
                        value={display}
                      >
                        <div
                          className={cn(
                            'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                            isSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'opacity-50 [&_svg]:invisible'
                          )}
                        >
                          <span className="text-xs">✓</span>
                        </div>
                        {display}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Hidden inputs for form submission */}
      {selectedItems.map((item) => (
        <input key={item.id} name={`${name}[]`} type="hidden" value={item.id} />
      ))}

      {/* Empty input for when no items selected */}
      {selectedItems.length === 0 && (
        <input name={`${name}[]`} type="hidden" value="" />
      )}
    </div>
  );
}
