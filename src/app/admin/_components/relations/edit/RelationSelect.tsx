'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
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

interface RelationSelectProps {
  name: string;
  label: string;
  value?: any;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  relatedModel: string;
  field: AdminField;
}

export function RelationSelect({
  name,
  label,
  value,
  required,
  disabled,
  placeholder,
  relatedModel,
  field,
}: RelationSelectProps) {
  const [open, setOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string>(
    value?.id?.toString() || ''
  );
  const [selectedDisplay, setSelectedDisplay] = useState<string>('');
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
  const pageSize = field.relationEditOptions?.pageSize || 20;

  const getDisplayValue = useCallback(
    (record: any): string => {
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
    },
    [displayFields]
  );

  const loadSingleRecord = useCallback(
    async (id: string | number) => {
      try {
        const response = await fetch(
          `/api/admin/data?model=${relatedModel}&id=${id}`
        );
        if (response.ok) {
          const record = await response.json();
          const display = getDisplayValue(record);
          setSelectedDisplay(display);
        }
      } catch (_error) {}
    },
    [relatedModel, getDisplayValue]
  );

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

  // Load initial value display
  useEffect(() => {
    if (value && typeof value === 'object') {
      const display = getDisplayValue(value);
      setSelectedDisplay(display);
      setSelectedValue(value.id?.toString() || '');
    } else if (value) {
      // Value is just an ID, load the full record
      loadSingleRecord(value);
    }
  }, [value, getDisplayValue, loadSingleRecord]);

  // Load options when dropdown opens or search changes
  useEffect(() => {
    if (open) {
      loadOptions();
    }
  }, [open, loadOptions]);

  function handleSelect(option: any) {
    const optionId = option.id?.toString() || '';
    setSelectedValue(optionId);
    setSelectedDisplay(getDisplayValue(option));
    setOpen(false);
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="ms-1 text-red-500">*</span>}
      </Label>

      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
            variant="outline"
          >
            {selectedDisplay || placeholder || `Select ${label}...`}
            <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50 rtl:scale-x-[-1]" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-full p-0">
          <Command>
            {searchable && (
              <CommandInput
                onValueChange={setSearch}
                placeholder={`Search ${label.toLowerCase()}...`}
              />
            )}
            <CommandEmpty>
              {loading ? 'Loading...' : 'No results found.'}
            </CommandEmpty>
            <CommandGroup>
              {!required && (
                <CommandItem
                  onSelect={() => {
                    setSelectedValue('');
                    setSelectedDisplay('');
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'me-2 h-4 w-4',
                      selectedValue === '' ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <span className="text-muted-foreground">None</span>
                </CommandItem>
              )}
              {options.map((option) => {
                const optionId = option.id?.toString() || '';
                const display = getDisplayValue(option);

                return (
                  <CommandItem
                    key={optionId}
                    onSelect={() => handleSelect(option)}
                    value={display}
                  >
                    <Check
                      className={cn(
                        'me-2 h-4 w-4',
                        selectedValue === optionId ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {display}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Hidden input for form submission */}
      <input
        name={name}
        required={required}
        type="hidden"
        value={selectedValue}
      />
    </div>
  );
}
