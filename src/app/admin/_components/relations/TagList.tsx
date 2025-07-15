'use client';

import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  getRelationDisplayValue,
  type RelationFieldProps,
  shouldShowAction,
} from './RelationField';

export function TagList({
  field,
  value,
  modelName,
  onFilter,
}: RelationFieldProps) {
  const router = useRouter();

  // Ensure value is an array
  const items = Array.isArray(value) ? value : [value];
  const maxDisplay = field.relationEditOptions?.maxDisplay || 3;
  const displayItems = items.slice(0, maxDisplay);
  const remainingCount = items.length - maxDisplay;

  const handleTagClick = (item: any) => {
    if (!shouldShowAction(field, 'filter')) {
      return;
    }

    if (onFilter) {
      onFilter(field.name, item.id);
    } else {
      // Default filter implementation
      const params = new URLSearchParams(window.location.search);
      params.set(
        'filters',
        JSON.stringify([
          {
            field: field.name,
            operator: 'contains',
            value: item.id,
            displayValue: getRelationDisplayValue(
              item,
              field.relationEditOptions?.previewFields
            ),
          },
        ])
      );
      router.push(`/admin/${modelName}?${params.toString()}`);
    }
  };

  const handleViewAll = () => {
    if (!shouldShowAction(field, 'viewAll')) {
      return;
    }

    // Navigate to the related model's list page
    const relationModel = field.type.toLowerCase();
    router.push(`/admin/${relationModel}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-1">
      {displayItems.map((item) => (
        <Badge
          className={
            shouldShowAction(field, 'filter')
              ? 'cursor-pointer hover:bg-secondary/80'
              : ''
          }
          key={item.id}
          onClick={() =>
            shouldShowAction(field, 'filter') && handleTagClick(item)
          }
          variant="secondary"
        >
          {getRelationDisplayValue(
            item,
            field.relationEditOptions?.previewFields
          )}
        </Badge>
      ))}
      {remainingCount > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                className={
                  shouldShowAction(field, 'viewAll')
                    ? 'cursor-pointer hover:bg-secondary/80'
                    : 'cursor-help'
                }
                onClick={
                  shouldShowAction(field, 'viewAll') ? handleViewAll : undefined
                }
                variant="outline"
              >
                +{remainingCount} more
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="flex max-h-48 flex-col gap-1 overflow-y-auto">
                {items.slice(maxDisplay).map((item) => (
                  <Badge
                    className={
                      shouldShowAction(field, 'filter') ? 'cursor-pointer' : ''
                    }
                    key={item.id}
                    onClick={() =>
                      shouldShowAction(field, 'filter') && handleTagClick(item)
                    }
                    variant="secondary"
                  >
                    {getRelationDisplayValue(
                      item,
                      field.relationEditOptions?.previewFields
                    )}
                  </Badge>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
