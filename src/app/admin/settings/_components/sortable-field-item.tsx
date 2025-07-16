'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import type { AdminField } from '@/lib/admin/types';
import { cn } from '@/lib/utils';

interface SortableFieldItemProps {
  field: AdminField;
  isSelected: boolean;
  onClick: () => void;
}

export function SortableFieldItem({
  field,
  isSelected,
  onClick,
}: SortableFieldItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      className={cn(
        'group relative flex w-full cursor-pointer items-center gap-2 rounded-md border p-3 text-start transition-colors hover:bg-muted/50',
        isSelected && 'border-primary bg-muted',
        isDragging && 'opacity-50'
      )}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      ref={setNodeRef}
      role="button"
      style={style}
      tabIndex={0}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="cursor-move touch-none"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>

      <div className="flex-1 overflow-hidden">
        <div className="flex items-center gap-1">
          <span className="truncate font-medium text-sm">{field.name}</span>
          {field.required && <span className="text-red-500">*</span>}
        </div>
        <div className="text-muted-foreground text-xs">
          {field.type}
          {field.list && '[]'}
          {field.relationField && (
            <span className="ms-1">
              • {field.list ? 'one-to-many' : 'many-to-one'}
            </span>
          )}
        </div>
      </div>

      {/* Visual indicators */}
      <div className="flex items-center gap-1">
        {field.unique && (
          <span className="rounded bg-blue-100 px-1.5 py-0.5 font-medium text-blue-700 text-xs dark:bg-blue-900/20 dark:text-blue-400">
            Unique
          </span>
        )}
        {field.isId && (
          <span className="rounded bg-purple-100 px-1.5 py-0.5 font-medium text-purple-700 text-xs dark:bg-purple-900/20 dark:text-purple-400">
            ID
          </span>
        )}
      </div>
    </div>
  );
}
