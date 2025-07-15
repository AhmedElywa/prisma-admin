'use client';

import { Filter, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { AdvancedFilterPanel } from './advanced-filter-panel';
import type { FilterConfig, FilterValue } from './types';

interface FilterPanelProps {
  fields: FilterConfig[];
  modelName: string;
  getRelationFields?: (modelName: string) => Promise<FilterConfig[]>;
}

export function FilterPanel({
  fields,
  modelName,
  getRelationFields,
}: FilterPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  // Parse filters from URL
  const urlFilters = searchParams.get('filters');
  const currentFilters: FilterValue[] = urlFilters
    ? JSON.parse(decodeURIComponent(urlFilters))
    : [];

  const [tempFilters, setTempFilters] = useState<FilterValue[]>(currentFilters);
  const [justCleared, setJustCleared] = useState(false);

  // Check if filters have changed - compare meaningful properties only
  const normalizeFilter = (filter: FilterValue) => {
    const { field, operator, value, type } = filter;
    return { field, operator, value, type };
  };

  const normalizedTemp = tempFilters.map(normalizeFilter);
  const normalizedCurrent = currentFilters.map(normalizeFilter);

  const hasChanges =
    JSON.stringify(normalizedTemp) !== JSON.stringify(normalizedCurrent) ||
    justCleared;

  const handleApplyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (tempFilters.length > 0) {
      params.set('filters', encodeURIComponent(JSON.stringify(tempFilters)));
    } else {
      params.delete('filters');
    }

    // Reset to page 1 when filters change
    params.set('page', '1');

    router.push(`?${params.toString()}`);
    setIsOpen(false);
    setJustCleared(false);
  };

  const handleClearFilters = () => {
    setTempFilters([]);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('filters');
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const handleRemoveFilter = (index: number) => {
    const newFilters = currentFilters.filter((_, i) => i !== index);
    const params = new URLSearchParams(searchParams.toString());

    if (newFilters.length > 0) {
      params.set('filters', encodeURIComponent(JSON.stringify(newFilters)));
    } else {
      params.delete('filters');
    }

    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const getFilterLabel = (filter: FilterValue) => {
    const field = fields.find((f) => f.field === filter.field);
    if (!field) {
      return filter.field;
    }

    let label = `${field.label} `;

    switch (filter.operator) {
      case 'equals':
        label += '=';
        break;
      case 'not':
        label += '≠';
        break;
      case 'contains':
        label += 'contains';
        break;
      case 'startsWith':
        label += 'starts with';
        break;
      case 'endsWith':
        label += 'ends with';
        break;
      case 'lt':
        label += '<';
        break;
      case 'lte':
        label += '≤';
        break;
      case 'gt':
        label += '>';
        break;
      case 'gte':
        label += '≥';
        break;
      case 'in':
        label += 'in';
        break;
      case 'notIn':
        label += 'not in';
        break;
      case 'isNull':
        return `${field.label} is empty`;
      case 'isNotNull':
        return `${field.label} is not empty`;
      case 'is':
        label += 'is';
        break;
      case 'isNot':
        label += 'is not';
        break;
      case 'every':
        label += 'all match';
        break;
      case 'some':
        label += 'any match';
        break;
      case 'none':
        label += 'none match';
        break;
      default:
        label += filter.operator;
    }

    if (filter.value !== null && filter.value !== undefined) {
      if (Array.isArray(filter.value)) {
        label += ` [${filter.value.length} items]`;
      } else if (typeof filter.value === 'object') {
        label += ' ...';
      } else {
        label += ` ${filter.value}`;
      }
    }

    return label;
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Sheet
        onOpenChange={(open) => {
          setIsOpen(open);
          // Reset temp filters to current when opening
          if (open) {
            setTempFilters(currentFilters);
            setJustCleared(false);
          }
        }}
        open={isOpen}
      >
        <SheetTrigger asChild>
          <Button size="sm" variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {currentFilters.length > 0 && (
              <Badge className="ml-2" variant="secondary">
                {currentFilters.length}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="flex w-[500px] flex-col sm:w-[700px] sm:max-w-[700px] lg:w-[800px] lg:max-w-[800px]">
          <SheetHeader className="space-y-1 px-6">
            <SheetTitle>Filter {modelName}</SheetTitle>
            <p className="text-muted-foreground text-sm">
              Add filters to refine your search results
            </p>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <AdvancedFilterPanel
              fields={fields}
              filters={tempFilters}
              getRelationFields={getRelationFields}
              key={isOpen ? 'open' : 'closed'}
              onChange={setTempFilters}
            />
          </div>

          <div className="space-y-2 border-t px-6 pt-4 pb-4">
            <div className="flex gap-2">
              <Button
                className="flex-1"
                disabled={
                  tempFilters.length === 0 && currentFilters.length === 0
                }
                onClick={() => {
                  setTempFilters([]);
                  // If there are current filters, mark that we just cleared
                  if (currentFilters.length > 0) {
                    setJustCleared(true);
                  }
                }}
                variant="outline"
              >
                Clear All
              </Button>
              <Button
                className="flex-1"
                disabled={!hasChanges}
                onClick={handleApplyFilters}
              >
                {hasChanges
                  ? `Apply ${tempFilters.length > 0 ? `(${tempFilters.length})` : 'Changes'}`
                  : 'No Changes'}
              </Button>
            </div>
            {hasChanges && (
              <p className="text-center text-muted-foreground text-xs">
                {tempFilters.length === 0 && currentFilters.length > 0
                  ? 'All filters will be cleared'
                  : tempFilters.length > currentFilters.length
                    ? `${tempFilters.length - currentFilters.length} new filter${tempFilters.length - currentFilters.length > 1 ? 's' : ''} to apply`
                    : currentFilters.length > tempFilters.length
                      ? `${currentFilters.length - tempFilters.length} filter${currentFilters.length - tempFilters.length > 1 ? 's' : ''} to remove`
                      : 'Filters have been modified'}
              </p>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {currentFilters.length > 0 && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            {currentFilters.map((filter, index) => (
              <Badge
                className="gap-1"
                key={`filter-${index}-${filter.field}-${filter.operator}`}
                variant="secondary"
              >
                <span className="text-xs">{getFilterLabel(filter)}</span>
                <button
                  className="ml-1 hover:text-destructive"
                  onClick={() => handleRemoveFilter(index)}
                  type="button"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <Button
            className="text-xs"
            onClick={handleClearFilters}
            size="sm"
            variant="ghost"
          >
            Clear all
          </Button>
        </>
      )}
    </div>
  );
}
