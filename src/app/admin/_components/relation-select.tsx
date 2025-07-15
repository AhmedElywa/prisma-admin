'use client';

import debounce from 'lodash/debounce';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { getModelData } from '@/lib/actions/crud';
import { getModelSettingsAction } from '@/lib/actions/settings-actions';
import { cn } from '@/lib/utils';

interface RelationSelectProps {
  name: string;
  label: string;
  relatedModel: string;
  value?: any;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function RelationSelect({
  name,
  label,
  relatedModel,
  value,
  required = false,
  disabled = false,
  placeholder = 'Select...',
}: RelationSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedValue, setSelectedValue] = useState<any>(value);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [displayFields, setDisplayFields] = useState<string[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  // Load display fields configuration
  useEffect(() => {
    async function loadDisplayFields() {
      const modelSettings = await getModelSettingsAction(relatedModel);
      if (modelSettings) {
        setDisplayFields(modelSettings.displayFields);
      }
    }
    loadDisplayFields();
  }, [relatedModel]);

  // Debounced search function
  const debouncedLoadItems = useCallback(
    debounce(async (searchTerm: string, pageNum = 1) => {
      setLoading(true);
      try {
        const result = await getModelData(relatedModel, {
          page: pageNum,
          perPage: 50,
          search: searchTerm,
        });

        if (pageNum === 1) {
          setItems(result.data);
        } else {
          setItems((prev) => [...prev, ...result.data]);
        }

        setHasMore(result.page < result.totalPages);
      } catch (_error) {
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  // Load items when search changes
  useEffect(() => {
    if (open) {
      setPage(1);
      debouncedLoadItems(search, 1);
    }
  }, [search, open, debouncedLoadItems]);

  // Load initial value details if needed
  useEffect(() => {
    async function loadInitialValue() {
      if (value && (!selectedValue || selectedValue.id !== value)) {
        try {
          const result = await getModelData(relatedModel, {
            page: 1,
            perPage: 1,
            filters: [{ field: 'id', operator: 'equals', value }],
          });
          if (result.data.length > 0) {
            setSelectedValue(result.data[0]);
          }
        } catch (_error) {}
      }
    }
    loadInitialValue();
  }, [value, relatedModel, selectedValue]);

  // Get display text for an item
  const _getItemDisplay = (item: any) => {
    if (!item) {
      return '';
    }
    return formatDisplayValue(item);
  };

  // Format display value synchronously for rendering
  const formatDisplayValue = (item: any) => {
    if (!item) {
      return '';
    }

    // Try to use display fields
    if (displayFields.length > 0) {
      const values = displayFields
        .map((field) => item[field])
        .filter((val) => val !== null && val !== undefined)
        .map(String);

      if (values.length > 0) {
        return values.join(' - ');
      }
    }

    // Fallback to common fields
    return (
      item.name || item.title || item.email || item.username || `ID: ${item.id}`
    );
  };

  // Handle item selection
  const handleSelect = (item: any) => {
    setSelectedValue(item);
    setOpen(false);
  };

  // Load more items when scrolling to bottom
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      debouncedLoadItems(search, nextPage);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </Label>

      <input name={name} type="hidden" value={selectedValue?.id || ''} />

      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
            role="combobox"
            variant="outline"
          >
            <span className="truncate">
              {selectedValue ? formatDisplayValue(selectedValue) : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-full p-0">
          <Command shouldFilter={false}>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <input
                className="flex h-11 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${label.toLowerCase()}...`}
                value={search}
              />
            </div>
            <CommandList>
              {loading && items.length === 0 ? (
                <div className="py-6 text-center text-muted-foreground text-sm">
                  Loading...
                </div>
              ) : items.length === 0 ? (
                <CommandEmpty>No results found.</CommandEmpty>
              ) : (
                <CommandGroup>
                  {items.map((item) => (
                    <CommandItem
                      className="flex items-center justify-between"
                      key={item.id}
                      onSelect={() => handleSelect(item)}
                      value={item.id}
                    >
                      <div className="flex flex-col">
                        <span>{formatDisplayValue(item)}</span>
                        {item.id && (
                          <span className="text-muted-foreground text-xs">
                            ID: {item.id}
                          </span>
                        )}
                      </div>
                      <Check
                        className={cn(
                          'ml-auto h-4 w-4',
                          selectedValue?.id === item.id
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                    </CommandItem>
                  ))}
                  {hasMore && (
                    <CommandItem
                      className="cursor-pointer justify-center text-muted-foreground text-sm"
                      onSelect={handleLoadMore}
                    >
                      {loading ? 'Loading more...' : 'Load more'}
                    </CommandItem>
                  )}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {!required && selectedValue && (
        <Button
          className="mt-1"
          disabled={disabled}
          onClick={() => setSelectedValue(null)}
          size="sm"
          type="button"
          variant="ghost"
        >
          Clear selection
        </Button>
      )}
    </div>
  );
}
