'use client';

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit,
  Search,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { AdminField } from '@/lib/admin/types';
import { BulkActions } from './bulk-actions';
import { FilterPanel } from './filters/filter-panel';
import type { FilterConfig } from './filters/types';
import { RelationField } from './relations/RelationField';

interface DataTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type?: string;
  relationTo?: string; // Related model name
  relationFrom?: string; // Foreign key field name
  isRelation?: boolean;
  isList?: boolean; // Whether it's a one-to-many relation
  field?: AdminField; // Full field metadata for relations
}

interface DataRecord {
  id: string | number;
  [key: string]: any;
}

interface DataTableProps<T extends DataRecord = DataRecord> {
  data: T[];
  columns: DataTableColumn[];
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  searchValue?: string;
  searchPlaceholder?: string;
  modelName?: string;
  canEdit?: boolean;
  canDelete?: boolean;
  filterFields?: FilterConfig[];
  getRelationFields?: (modelName: string) => Promise<FilterConfig[]>;
  compact?: boolean;
  enableBulkActions?: boolean;
}

// Props for TableRowCheckbox component
interface TableRowCheckboxProps {
  rowId: string | number;
  enableBulkActions: boolean;
  canDelete?: boolean;
  modelName?: string;
  compact: boolean;
  checked: boolean;
  onCheckedChange: (rowId: string | number, checked: boolean) => void;
}

// Props for TableRowActions component
interface TableRowActionsProps {
  rowId: string | number;
  canEdit?: boolean;
  canDelete?: boolean;
  modelName?: string;
  compact: boolean;
  deletingId: string | number | null;
  onDelete: (rowId: string | number) => void;
}

// Component for row checkbox
function TableRowCheckbox({
  rowId,
  enableBulkActions,
  canDelete,
  modelName,
  compact,
  checked,
  onCheckedChange,
}: TableRowCheckboxProps) {
  if (!(enableBulkActions && (canDelete || modelName))) {
    return null;
  }

  return (
    <TableCell className={compact ? 'py-2' : ''}>
      <Checkbox
        aria-label={`Select row ${rowId}`}
        checked={checked}
        onCheckedChange={(checked) =>
          onCheckedChange(rowId, checked as boolean)
        }
      />
    </TableCell>
  );
}

// Component for row actions
function TableRowActions({
  rowId,
  canEdit,
  canDelete,
  modelName,
  compact,
  deletingId,
  onDelete,
}: TableRowActionsProps) {
  if (!(canEdit || canDelete)) {
    return null;
  }

  return (
    <TableCell className={compact ? 'py-2' : ''}>
      <div className="flex items-center gap-1">
        {canEdit && modelName && (
          <Link href={`/admin/${modelName.toLowerCase()}/${rowId}`}>
            <Button
              className={compact ? 'h-7 w-7' : ''}
              size={compact ? 'sm' : 'icon'}
              variant="ghost"
            >
              <Edit className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
            </Button>
          </Link>
        )}
        {canDelete && (
          <Button
            className={compact ? 'h-7 w-7' : ''}
            disabled={deletingId === rowId}
            onClick={() => onDelete(rowId)}
            size={compact ? 'sm' : 'icon'}
            variant="ghost"
          >
            <Trash2 className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
          </Button>
        )}
      </div>
    </TableCell>
  );
}

export function DataTable<T extends DataRecord = DataRecord>({
  data,
  columns,
  totalItems,
  currentPage,
  itemsPerPage,
  totalPages,
  searchValue,
  searchPlaceholder = 'Search...',
  modelName,
  canEdit,
  canDelete,
  filterFields,
  getRelationFields,
  compact = false,
  enableBulkActions = true,
}: DataTableProps<T>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchValue || '');
  const [_isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(
    new Set()
  );

  const orderBy = searchParams.get('sort') || columns[0]?.key;
  const order = (searchParams.get('order') || 'asc') as 'asc' | 'desc';

  const updateUrl = (params: Record<string, string | number | undefined>) => {
    const newParams = new URLSearchParams(searchParams.toString());

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        newParams.set(key, value.toString());
      } else {
        newParams.delete(key);
      }
    });

    router.push(`?${newParams.toString()}`);
  };

  const handleSort = (key: string) => {
    if (key === orderBy) {
      updateUrl({ order: order === 'asc' ? 'desc' : 'asc' });
    } else {
      updateUrl({ sort: key, order: 'asc' });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl({ search: search || undefined, page: 1 });
  };

  const handleDelete = (id: string | number) => {
    if (
      !(
        canDelete &&
        modelName &&
        confirm('Are you sure you want to delete this item?')
      )
    ) {
      return;
    }

    setDeletingId(id);
    startTransition(async () => {
      try {
        const { deleteModelRecord } = await import('@/lib/actions/crud');
        await deleteModelRecord(modelName, id);
        router.refresh();
      } catch (_error) {
        alert('Failed to delete item');
      } finally {
        setDeletingId(null);
      }
    });
  };

  const renderSortIcon = (columnKey: string) => {
    if (columnKey !== orderBy) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return order === 'asc' ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  // Helper function to create AdminField for backward compatibility
  const createAdminField = (
    column: DataTableColumn,
    isList = false
  ): AdminField => {
    return {
      id: `${modelName}.${column.key}`,
      name: column.key,
      title: column.label,
      type: column.relationTo || 'String',
      kind: 'object',
      list: isList || Boolean(column.isList),
      required: false,
      isId: false,
      unique: false,
      order: 0,
      relationField: true,
      relationFrom: column.relationFrom,
      read: true,
      filter: true,
      sort: false,
      create: false,
      update: false,
      editor: false,
      upload: false,
      relationDisplayMode: isList ? 'tags' : 'dropdown',
      relationActions: {
        filter: true,
        view: !isList,
        edit: !isList,
        viewAll: true,
      },
    };
  };

  // Helper function to render relation field
  const renderRelation = (
    value: any,
    column: DataTableColumn,
    field?: AdminField,
    rowId?: string | number
  ): React.ReactNode => {
    if (field) {
      return (
        <RelationField
          field={field}
          modelName={modelName || ''}
          rowId={rowId}
          value={value}
        />
      );
    }
    if (column.relationTo) {
      const adminField = createAdminField(column, Array.isArray(value));
      return (
        <RelationField
          field={adminField}
          modelName={modelName || ''}
          rowId={rowId}
          value={value}
        />
      );
    }
    return null;
  };

  // Helper function to render array values
  const renderArray = (value: any[]): string => {
    return value.map((v) => v.id || v).join(', ');
  };

  // Helper function to render boolean values
  const renderBoolean = (value: boolean): string => {
    return value ? '✓' : '✗';
  };

  // Helper function to render date values
  const renderDate = (value: Date | string): string => {
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }
    return new Date(value).toLocaleDateString();
  };

  // Helper function to render JSON values
  const renderJson = (value: any): React.ReactNode => {
    return <code className="text-xs">{JSON.stringify(value)}</code>;
  };

  // Helper function to handle object values
  const renderObject = (
    value: any,
    column: DataTableColumn
  ): React.ReactNode => {
    if (column.isRelation && column.relationTo && value.id) {
      return renderRelation(value, column);
    }
    return value.id || '-';
  };

  // Helper function to render custom type values
  const renderCustomType = (
    value: any,
    column: DataTableColumn
  ): React.ReactNode => {
    if (Array.isArray(value)) {
      if (column.isRelation) {
        return renderRelation(value, column, column.field);
      }
      return renderArray(value);
    }
    return value.toString();
  };

  const renderCellValue = (
    value: any,
    column: DataTableColumn,
    rowId?: string | number
  ): React.ReactNode => {
    if (value === null || value === undefined) {
      return '-';
    }

    // Handle relations with full metadata
    if (column.isRelation && column.field) {
      return renderRelation(value, column, column.field, rowId);
    }

    // Handle object values (potential relations)
    if (
      typeof value === 'object' &&
      !Array.isArray(value) &&
      !(value instanceof Date)
    ) {
      return renderObject(value, column);
    }

    // Handle different column types
    switch (column.type) {
      case 'boolean':
        return renderBoolean(value);
      case 'date':
      case 'datetime':
        return renderDate(value);
      case 'json':
        return renderJson(value);
      case 'custom':
        return renderCustomType(value, column);
      default:
        if (Array.isArray(value)) {
          return renderArray(value);
        }
        return value.toString();
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(data.map((row) => row.id));
      setSelectedRows(allIds);
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (id: string | number, checked: boolean) => {
    const newSelection = new Set(selectedRows);
    if (checked) {
      newSelection.add(id);
    } else {
      newSelection.delete(id);
    }
    setSelectedRows(newSelection);
  };

  const isAllSelected =
    data.length > 0 && data.every((row) => selectedRows.has(row.id));
  const isIndeterminate =
    data.some((row) => selectedRows.has(row.id)) && !isAllSelected;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <form
          className="flex max-w-sm flex-1 items-center gap-2"
          onSubmit={handleSearch}
        >
          <div className="relative flex-1">
            <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              value={search}
            />
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>

        {filterFields && filterFields.length > 0 && (
          <FilterPanel
            fields={filterFields}
            getRelationFields={getRelationFields}
            modelName={modelName || ''}
          />
        )}
      </div>

      {enableBulkActions && selectedRows.size > 0 && modelName && (
        <BulkActions
          modelName={modelName}
          onClearSelection={() => setSelectedRows(new Set())}
          selectedCount={selectedRows.size}
          selectedIds={Array.from(selectedRows)}
        />
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {enableBulkActions && (canDelete || modelName) && (
                <TableHead className="w-[50px]">
                  <Checkbox
                    aria-label="Select all"
                    checked={isAllSelected || isIndeterminate}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead key={column.key}>
                  {column.sortable ? (
                    <Button
                      className="-ml-3 h-8 data-[state=open]:bg-accent"
                      onClick={() => handleSort(column.key)}
                      variant="ghost"
                    >
                      <span>{column.label}</span>
                      <span className="ml-2">{renderSortIcon(column.key)}</span>
                    </Button>
                  ) : (
                    column.label
                  )}
                </TableHead>
              ))}
              {(canEdit || canDelete) && (
                <TableHead className="w-[100px]">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  className="h-24 text-center text-muted-foreground"
                  colSpan={
                    columns.length +
                    (canEdit || canDelete ? 1 : 0) +
                    (enableBulkActions ? 1 : 0)
                  }
                >
                  No results found
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow
                  data-state={selectedRows.has(row.id) ? 'selected' : undefined}
                  key={row.id}
                >
                  <TableRowCheckbox
                    canDelete={canDelete}
                    checked={selectedRows.has(row.id)}
                    compact={compact}
                    enableBulkActions={enableBulkActions}
                    modelName={modelName}
                    onCheckedChange={handleSelectRow}
                    rowId={row.id}
                  />
                  {columns.map((column) => (
                    <TableCell
                      className={compact ? 'py-2' : ''}
                      key={column.key}
                    >
                      {renderCellValue(row[column.key], column, row.id)}
                    </TableCell>
                  ))}
                  <TableRowActions
                    canDelete={canDelete}
                    canEdit={canEdit}
                    compact={compact}
                    deletingId={deletingId}
                    modelName={modelName}
                    onDelete={handleDelete}
                    rowId={row.id}
                  />
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground text-sm">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{' '}
            results
          </div>

          <div className="flex items-center gap-2">
            <Button
              disabled={currentPage === 1}
              onClick={() => updateUrl({ page: 1 })}
              size="icon"
              variant="outline"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              disabled={currentPage === 1}
              onClick={() => updateUrl({ page: currentPage - 1 })}
              size="icon"
              variant="outline"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>

            <Button
              disabled={currentPage === totalPages}
              onClick={() => updateUrl({ page: currentPage + 1 })}
              size="icon"
              variant="outline"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              disabled={currentPage === totalPages}
              onClick={() => updateUrl({ page: totalPages })}
              size="icon"
              variant="outline"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
