'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
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

export function RelationCount({
  field,
  value,
  modelName,
  rowId,
  onNavigate,
}: RelationFieldProps) {
  const router = useRouter();

  // Handle different value formats
  let count = 0;
  let items: any[] = [];

  if (Array.isArray(value)) {
    count = value.length;
    items = value;
  } else if (typeof value === 'number') {
    count = value;
  } else if (value && typeof value === 'object') {
    // Handle Prisma's _count format
    if (value._count) {
      count = value._count[field.name] || 0;
    } else if (value[field.name]) {
      count = value[field.name];
    }
  }

  const handleClick = () => {
    if (!shouldShowAction(field, 'viewAll')) {
      return;
    }

    // Navigate to related model filtered by this record
    const relationModel = field.type.toLowerCase();

    // Get the parent record ID
    const parentId = rowId || window.location.pathname.split('/').at(-1);

    if (onNavigate && parentId) {
      onNavigate(relationModel, parentId);
    } else if (parentId) {
      const params = new URLSearchParams();

      // Check if this is a many-to-many relation (list field with no relationFrom)
      const isManyToMany = field.list && !field.relationFrom;

      let filter: {
        field: string;
        operator: string;
        value: any;
        type?: string;
      };
      if (isManyToMany && field.inverseRelationField) {
        // For many-to-many, use 'some' operator with the inverse relation field
        // e.g., when viewing tags of a post, filter tags where posts.some(id = postId)
        filter = {
          field: field.inverseRelationField,
          operator: 'some',
          value: {
            id:
              typeof parentId === 'string'
                ? Number.parseInt(parentId, 10) || parentId
                : parentId,
          },
          type: 'relation',
        };
      } else if (field.inverseRelationField) {
        // For one-to-many or many-to-one, use the foreign key field
        filter = {
          field: field.inverseRelationField,
          operator: 'equals',
          value:
            typeof parentId === 'string'
              ? Number.parseInt(parentId, 10) || parentId
              : parentId,
        };
      } else {
        // Fallback for backward compatibility
        const filterField = `${modelName.toLowerCase()}Id`;
        filter = {
          field: filterField,
          operator: 'equals',
          value:
            typeof parentId === 'string'
              ? Number.parseInt(parentId, 10) || parentId
              : parentId,
        };
      }

      params.set('filters', JSON.stringify([filter]));
      router.push(`/admin/${relationModel}?${params.toString()}`);
    }
  };

  const previewLimit = 5;
  const hasPreview = items.length > 0 && items.length <= previewLimit;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className={`h-auto p-1 font-normal ${
              shouldShowAction(field, 'viewAll')
                ? 'cursor-pointer hover:bg-muted'
                : 'cursor-default'
            }`}
            disabled={!shouldShowAction(field, 'viewAll')}
            onClick={handleClick}
            size="sm"
            variant="ghost"
          >
            <span className="font-medium">{count}</span>
            <span className="ml-1 text-muted-foreground">
              {field.title || field.name}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {hasPreview ? (
            <div className="max-w-xs">
              <div className="mb-1 font-medium">
                {field.title || field.name} ({count})
              </div>
              <div className="space-y-1 text-sm">
                {items.map((item, index) => (
                  <div className="text-muted-foreground" key={item.id || index}>
                    •{' '}
                    {getRelationDisplayValue(
                      item,
                      field.relationEditOptions?.previewFields
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {shouldShowAction(field, 'viewAll')
                ? `Click to view all ${count} ${field.title || field.name}`
                : `${count} ${field.title || field.name}`}
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
