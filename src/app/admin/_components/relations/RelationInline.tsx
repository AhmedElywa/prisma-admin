'use client';

import Link from 'next/link';
import {
  getRelationDisplayValue,
  type RelationFieldProps,
} from './RelationField';

export function RelationInline({
  field,
  value,
  modelName,
}: RelationFieldProps) {
  const relationModel = field.type.toLowerCase();

  // Handle array values (one-to-many or many-to-many)
  if (Array.isArray(value)) {
    const maxDisplay = field.relationEditOptions?.maxDisplay || 5;
    const displayItems = value.slice(0, maxDisplay);
    const hasMore = value.length > maxDisplay;

    return (
      <div className="space-y-1">
        {displayItems.map((item) => (
          <div className="text-sm" key={item.id}>
            <Link
              className="text-primary hover:underline"
              href={`/admin/${relationModel}/${item.id}`}
            >
              {getRelationDisplayValue(
                item,
                field.relationEditOptions?.previewFields
              )}
            </Link>
          </div>
        ))}
        {hasMore && (
          <div className="text-muted-foreground text-sm">
            ... and {value.length - maxDisplay} more
          </div>
        )}
      </div>
    );
  }

  // Handle single value (many-to-one or one-to-one)
  const displayValue = getRelationDisplayValue(
    value,
    field.relationEditOptions?.previewFields
  );

  return (
    <div className="text-sm">
      <Link
        className="text-primary hover:underline"
        href={`/admin/${relationModel}/${value.id}`}
      >
        {displayValue}
      </Link>
      {field.relationEditOptions?.previewFields &&
        field.relationEditOptions.previewFields.length > 1 && (
          <div className="mt-0.5 text-muted-foreground text-xs">
            {field.relationEditOptions.previewFields
              .slice(1)
              .map((field) => value[field])
              .filter(Boolean)
              .join(' • ')}
          </div>
        )}
    </div>
  );
}
