'use client';

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AdminField } from '@/lib/admin/types';
import { cn } from '@/lib/utils';

interface RelationDualListProps {
  name: string;
  label: string;
  value?: any[];
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  relatedModel: string;
  field: AdminField;
}

export function RelationDualList({
  name,
  label,
  value = [],
  required,
  disabled,
  relatedModel,
  field,
}: RelationDualListProps) {
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [selectedHighlight, setSelectedHighlight] = useState<Set<string>>(
    new Set()
  );
  const [availableHighlight, setAvailableHighlight] = useState<Set<string>>(
    new Set()
  );
  const [selectedSearch, setSelectedSearch] = useState('');
  const [availableSearch, setAvailableSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Get display fields from relation options
  const displayFields = field.relationEditOptions?.previewFields || [
    'id',
    'name',
    'title',
  ];
  const pageSize = field.relationEditOptions?.pageSize || 100;

  // Initialize data
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  async function loadAllData() {
    setLoading(true);
    try {
      // Load all available options
      const params = new URLSearchParams({
        model: relatedModel,
        page: '1',
        perPage: pageSize.toString(),
      });

      const response = await fetch(`/api/admin/data?${params}`);
      if (response.ok) {
        const data = await response.json();
        const allOptions = data.data || [];

        // Separate selected and available based on current value
        const selectedIds = new Set(
          (value || [])
            .map((item) => (typeof item === 'object' ? item.id : item))
            .filter(Boolean)
        );

        const selected: any[] = [];
        const available: any[] = [];

        allOptions.forEach((option: any) => {
          if (selectedIds.has(option.id)) {
            selected.push(option);
          } else {
            available.push(option);
          }
        });

        setSelectedItems(selected);
        setAvailableItems(available);
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

  function moveToSelected(items?: any[]) {
    const toMove =
      items ||
      availableItems.filter((item) =>
        availableHighlight.has(item.id.toString())
      );

    setSelectedItems([...selectedItems, ...toMove]);
    setAvailableItems(
      availableItems.filter((item) => !toMove.some((m) => m.id === item.id))
    );
    setAvailableHighlight(new Set());
  }

  function moveToAvailable(items?: any[]) {
    const toMove =
      items ||
      selectedItems.filter((item) => selectedHighlight.has(item.id.toString()));

    setAvailableItems([...availableItems, ...toMove]);
    setSelectedItems(
      selectedItems.filter((item) => !toMove.some((m) => m.id === item.id))
    );
    setSelectedHighlight(new Set());
  }

  function toggleHighlight(id: string, list: 'selected' | 'available') {
    const setHighlight =
      list === 'selected' ? setSelectedHighlight : setAvailableHighlight;

    setHighlight((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }

  function filterItems(items: any[], search: string) {
    if (!search) {
      return items;
    }

    const searchLower = search.toLowerCase();
    return items.filter((item) => {
      const display = getDisplayValue(item).toLowerCase();
      return display.includes(searchLower);
    });
  }

  const filteredAvailable = filterItems(availableItems, availableSearch);
  const filteredSelected = filterItems(selectedItems, selectedSearch);

  if (loading) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="h-[400px] animate-pulse rounded bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </Label>

      <div className="grid grid-cols-[1fr,auto,1fr] gap-4">
        {/* Available list */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-sm">Available</h4>
            <span className="text-muted-foreground text-xs">
              ({filteredAvailable.length})
            </span>
          </div>

          <div className="relative">
            <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
            <Input
              className="h-9 pl-8"
              onChange={(e) => setAvailableSearch(e.target.value)}
              placeholder="Search..."
              value={availableSearch}
            />
          </div>

          <div className="h-[300px] overflow-y-auto rounded-md border">
            {filteredAvailable.map((item) => {
              const id = item.id.toString();
              const isHighlighted = availableHighlight.has(id);

              return (
                <div
                  className={cn(
                    'cursor-pointer px-3 py-2 hover:bg-muted/50',
                    isHighlighted && 'bg-muted'
                  )}
                  key={id}
                  onClick={() => toggleHighlight(id, 'available')}
                >
                  {getDisplayValue(item)}
                </div>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col justify-center gap-2">
          <Button
            disabled={disabled || availableHighlight.size === 0}
            onClick={() => moveToSelected()}
            size="icon"
            title="Move selected"
            type="button"
            variant="outline"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            disabled={disabled || availableItems.length === 0}
            onClick={() => moveToSelected(availableItems)}
            size="icon"
            title="Move all"
            type="button"
            variant="outline"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>

          <Button
            disabled={disabled || selectedHighlight.size === 0}
            onClick={() => moveToAvailable()}
            size="icon"
            title="Remove selected"
            type="button"
            variant="outline"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            disabled={disabled || selectedItems.length === 0}
            onClick={() => moveToAvailable(selectedItems)}
            size="icon"
            title="Remove all"
            type="button"
            variant="outline"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Selected list */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-sm">Selected</h4>
            <span className="text-muted-foreground text-xs">
              ({filteredSelected.length})
            </span>
          </div>

          <div className="relative">
            <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
            <Input
              className="h-9 pl-8"
              onChange={(e) => setSelectedSearch(e.target.value)}
              placeholder="Search..."
              value={selectedSearch}
            />
          </div>

          <div className="h-[300px] overflow-y-auto rounded-md border">
            {filteredSelected.map((item) => {
              const id = item.id.toString();
              const isHighlighted = selectedHighlight.has(id);

              return (
                <div
                  className={cn(
                    'cursor-pointer px-3 py-2 hover:bg-muted/50',
                    isHighlighted && 'bg-muted'
                  )}
                  key={id}
                  onClick={() => toggleHighlight(id, 'selected')}
                >
                  {getDisplayValue(item)}
                </div>
              );
            })}
          </div>
        </div>
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
