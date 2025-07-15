'use client';

import { ChevronDown, Edit, Eye, Filter, List } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  getRelationDisplayValue,
  type RelationFieldProps,
  shouldShowAction,
} from './RelationField';

export function RelationDropdown({
  field,
  value,
  modelName,
  onFilter,
  onNavigate,
  onPreview,
}: RelationFieldProps) {
  const router = useRouter();

  // Handle invalid configuration - dropdown shouldn't be used for array values
  if (Array.isArray(value)) {
    return (
      <span className="text-muted-foreground">
        {value.length} {field.title || field.name}
      </span>
    );
  }

  const displayValue = getRelationDisplayValue(
    value,
    field.relationEditOptions?.previewFields
  );
  const relationModel = field.type.toLowerCase();

  const handleFilter = () => {
    if (onFilter && field.relationFrom) {
      onFilter(field.relationFrom, value.id);
    } else if (field.relationFrom) {
      // Default filter implementation using URL params
      const params = new URLSearchParams(window.location.search);
      params.set(
        'filters',
        JSON.stringify([
          {
            field: field.relationFrom,
            operator: 'equals',
            value: value.id,
          },
        ])
      );
      router.push(`/admin/${modelName}?${params.toString()}`);
    }
  };

  const handleView = () => {
    if (onNavigate) {
      onNavigate(relationModel, value.id);
    } else {
      router.push(`/admin/${relationModel}/${value.id}`);
    }
  };

  const handleEdit = () => {
    router.push(`/admin/${relationModel}/${value.id}/edit`);
  };

  const handleViewAll = () => {
    // This should not be shown for many-to-one relations
    // But if it is, we'll handle it gracefully
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="h-auto p-1 font-normal hover:bg-muted"
          variant="ghost"
        >
          <span className="mr-1">{displayValue}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {shouldShowAction(field, 'filter') && field.relationFrom && (
          <>
            <DropdownMenuItem onClick={handleFilter}>
              <Filter className="mr-2 h-4 w-4" />
              Filter by this {field.title}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {shouldShowAction(field, 'view') && (
          <DropdownMenuItem onClick={handleView}>
            <Eye className="mr-2 h-4 w-4" />
            View {field.title}
          </DropdownMenuItem>
        )}

        {shouldShowAction(field, 'edit') && (
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit {field.title}
          </DropdownMenuItem>
        )}

        {shouldShowAction(field, 'viewAll') && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleViewAll}>
              <List className="mr-2 h-4 w-4" />
              View all {modelName}s
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
