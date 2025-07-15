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

export function RelationBadge({
  field,
  value,
  modelName,
  onNavigate,
}: RelationFieldProps) {
  const router = useRouter();
  const relationModel = field.type.toLowerCase();

  // Handle array values
  if (Array.isArray(value)) {
    const count = value.length;
    const label = `${count} ${field.title || field.name}`;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              className={
                shouldShowAction(field, 'viewAll') ? 'cursor-pointer' : ''
              }
              onClick={() => {
                if (shouldShowAction(field, 'viewAll')) {
                  router.push(`/admin/${relationModel}`);
                }
              }}
              variant="outline"
            >
              {label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="max-w-xs">
              <div className="mb-1 font-medium">
                {field.title || field.name}
              </div>
              <div className="space-y-0.5 text-sm">
                {value.slice(0, 5).map((item) => (
                  <div className="text-muted-foreground" key={item.id}>
                    •{' '}
                    {getRelationDisplayValue(
                      item,
                      field.relationEditOptions?.previewFields
                    )}
                  </div>
                ))}
                {value.length > 5 && (
                  <div className="text-muted-foreground">
                    ... and {value.length - 5} more
                  </div>
                )}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Handle single value
  const displayValue = getRelationDisplayValue(
    value,
    field.relationEditOptions?.previewFields
  );

  return (
    <Badge
      className={shouldShowAction(field, 'view') ? 'cursor-pointer' : ''}
      onClick={() => {
        if (shouldShowAction(field, 'view')) {
          if (onNavigate) {
            onNavigate(relationModel, value.id);
          } else {
            router.push(`/admin/${relationModel}/${value.id}`);
          }
        }
      }}
      variant="secondary"
    >
      {displayValue}
    </Badge>
  );
}
