'use client';

import { debounce } from 'lodash';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
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

interface RelationAutocompleteProps {
  name: string;
  label: string;
  value?: any;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  relatedModel: string;
  field: AdminField;
}

export function RelationAutocomplete({
  name,
  label,
  value,
  required,
  disabled,
  placeholder,
  relatedModel,
  field,
}: RelationAutocompleteProps) {
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
  const pageSize = field.relationEditOptions?.pageSize || 20;
  const minChars = 2; // Minimum characters before searching

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
  }, [
    value,
    getDisplayValue, // Value is just an ID, load the full record
    loadSingleRecord,
  ]);

  async function loadSingleRecord(id: string | number) {
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
  }

  const loadOptions = useCallback(
    debounce(async (searchTerm: string) => {
      if (searchTerm.length < minChars) {
        setOptions([]);
        return;
      }

      setLoading(true);
      try {
        const params = new URLSearchParams({
          model: relatedModel,
          page: '1',
          perPage: pageSize.toString(),
          search: searchTerm,
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
    }, 300),
    []
  );

  useEffect(() => {
    if (open && search) {
      loadOptions(search);
    }
  }, [search, open, loadOptions]);

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
    const optionId = option.id?.toString() || '';
    setSelectedValue(optionId);
    setSelectedDisplay(getDisplayValue(option));
    setOpen(false);
    setSearch('');
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </Label>

      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
            role="combobox"
            variant="outline"
          >
            {selectedDisplay || placeholder || `Search ${label}...`}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-full p-0">
          <Command shouldFilter={false}>
            <CommandInput
              onValueChange={setSearch}
              placeholder={`Type at least ${minChars} characters to search...`}
              value={search}
            />
            {search.length < minChars ? (
              <div className="py-6 text-center text-muted-foreground text-sm">
                Type at least {minChars} characters to search
              </div>
            ) : loading ? (
              <div className="py-6 text-center">
                <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                <p className="mt-2 text-muted-foreground text-sm">
                  Searching...
                </p>
              </div>
            ) : options.length === 0 ? (
              <CommandEmpty>No results found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {!required && (
                  <CommandItem
                    onSelect={() => {
                      setSelectedValue('');
                      setSelectedDisplay('');
                      setOpen(false);
                      setSearch('');
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
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
                          'mr-2 h-4 w-4',
                          selectedValue === optionId
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                      {display}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
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
