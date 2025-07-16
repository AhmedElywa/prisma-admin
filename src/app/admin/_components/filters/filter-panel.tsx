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

// Constants
const operatorLabels: Record<string, string> = {
  equals: '=',
  not: '≠',
  contains: 'contains',
  startsWith: 'starts with',
  endsWith: 'ends with',
  lt: '<',
  lte: '≤',
  gt: '>',
  gte: '≥',
  in: 'in',
  notIn: 'not in',
  is: 'is',
  isNot: 'is not',
  every: 'all match',
  some: 'any match',
  none: 'none match',
};

// Helper functions
const normalizeFilter = (filter: FilterValue) => {
  const { field, operator, value, type } = filter;
  return { field, operator, value, type };
};

const formatFilterValue = (value: any) => {
  if (value === null || value === undefined) {
    return '';
  }
  if (Array.isArray(value)) {
    return ` [${value.length} items]`;
  }
  if (typeof value === 'object') {
    return ' ...';
  }
  return ` ${value}`;
};

const updateUrlWithFilters = (
  filters: FilterValue[],
  searchParams: URLSearchParams,
  router: any
) => {
  const params = new URLSearchParams(searchParams.toString());

  if (filters.length > 0) {
    params.set('filters', encodeURIComponent(JSON.stringify(filters)));
  } else {
    params.delete('filters');
  }

  params.set('page', '1');
  router.push(`?${params.toString()}`);
};

// Helper component to show filter change message
const FilterChangeMessage = ({
  currentCount,
  tempCount,
}: {
  currentCount: number;
  tempCount: number;
}) => {
  const getMessage = () => {
    if (tempCount === 0 && currentCount > 0) {
      return 'All filters will be cleared';
    }

    const diff = tempCount - currentCount;
    if (diff > 0) {
      return `${diff} new filter${diff > 1 ? 's' : ''} to apply`;
    }

    if (diff < 0) {
      const removedCount = Math.abs(diff);
      return `${removedCount} filter${removedCount > 1 ? 's' : ''} to remove`;
    }

    return 'Filters have been modified';
  };

  return (
    <p className="text-center text-muted-foreground text-xs">{getMessage()}</p>
  );
};

// Component to display active filters
const ActiveFilters = ({
  filters,
  getFilterLabel,
  onRemoveFilter,
  onClearAll,
}: {
  filters: FilterValue[];
  getFilterLabel: (filter: FilterValue) => string;
  onRemoveFilter: (index: number) => void;
  onClearAll: () => void;
}) => {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((filter, index) => (
          <Badge
            className="gap-1"
            key={`filter-${index}-${filter.field}-${filter.operator}`}
            variant="secondary"
          >
            <span className="text-xs">{getFilterLabel(filter)}</span>
            <button
              className="ml-1 hover:text-destructive"
              onClick={() => onRemoveFilter(index)}
              type="button"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Button
        className="text-xs"
        onClick={onClearAll}
        size="sm"
        variant="ghost"
      >
        Clear all
      </Button>
    </>
  );
};

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
  const normalizedTemp = tempFilters.map(normalizeFilter);
  const normalizedCurrent = currentFilters.map(normalizeFilter);

  const hasChanges =
    JSON.stringify(normalizedTemp) !== JSON.stringify(normalizedCurrent) ||
    justCleared;

  const handleApplyFilters = () => {
    updateUrlWithFilters(tempFilters, searchParams, router);
    setIsOpen(false);
    setJustCleared(false);
  };

  const handleClearFilters = () => {
    setTempFilters([]);
    updateUrlWithFilters([], searchParams, router);
  };

  const handleRemoveFilter = (index: number) => {
    const newFilters = currentFilters.filter((_, i) => i !== index);
    updateUrlWithFilters(newFilters, searchParams, router);
  };

  const getFilterLabel = (filter: FilterValue) => {
    const field = fields.find((f) => f.field === filter.field);
    if (!field) {
      return filter.field;
    }

    // Special cases for null operators
    if (filter.operator === 'isNull') {
      return `${field.label} is empty`;
    }
    if (filter.operator === 'isNotNull') {
      return `${field.label} is not empty`;
    }

    // Standard operators
    const operatorLabel = operatorLabels[filter.operator] || filter.operator;
    const valueLabel = formatFilterValue(filter.value);

    return `${field.label} ${operatorLabel}${valueLabel}`;
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
              <FilterChangeMessage
                currentCount={currentFilters.length}
                tempCount={tempFilters.length}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {currentFilters.length > 0 && (
        <ActiveFilters
          filters={currentFilters}
          getFilterLabel={getFilterLabel}
          onClearAll={handleClearFilters}
          onRemoveFilter={handleRemoveFilter}
        />
      )}
    </div>
  );
}
