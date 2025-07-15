'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Edit,
  Trash2,
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { FilterPanel } from './filters/filter-panel'
import { FilterConfig } from './filters/types'
import { BulkActions } from './bulk-actions'
import { RelationField } from './relations/RelationField'
import { AdminField } from '@/lib/admin/types'

interface DataTableColumn {
  key: string
  label: string
  sortable?: boolean
  type?: string
  relationTo?: string // Related model name
  relationFrom?: string // Foreign key field name
  isRelation?: boolean
  isList?: boolean // Whether it's a one-to-many relation
  field?: AdminField // Full field metadata for relations
}

interface DataRecord {
  id: string | number
  [key: string]: any
}

interface DataTableProps<T extends DataRecord = DataRecord> {
  data: T[]
  columns: DataTableColumn[]
  totalItems: number
  currentPage: number
  itemsPerPage: number
  totalPages: number
  searchValue?: string
  searchPlaceholder?: string
  modelName?: string
  canEdit?: boolean
  canDelete?: boolean
  filterFields?: FilterConfig[]
  getRelationFields?: (modelName: string) => Promise<FilterConfig[]>
  compact?: boolean
  enableBulkActions?: boolean
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
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchValue || '')
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | number | null>(null)
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set())
  
  const orderBy = searchParams.get('sort') || columns[0]?.key
  const order = (searchParams.get('order') || 'asc') as 'asc' | 'desc'

  const updateUrl = (params: Record<string, string | number | undefined>) => {
    const newParams = new URLSearchParams(searchParams.toString())
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        newParams.set(key, value.toString())
      } else {
        newParams.delete(key)
      }
    })

    router.push(`?${newParams.toString()}`)
  }

  const handleSort = (key: string) => {
    if (key === orderBy) {
      updateUrl({ order: order === 'asc' ? 'desc' : 'asc' })
    } else {
      updateUrl({ sort: key, order: 'asc' })
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateUrl({ search: search || undefined, page: 1 })
  }

  const handleDelete = async (id: string | number) => {
    if (!canDelete || !modelName || !confirm('Are you sure you want to delete this item?')) return
    
    setDeletingId(id)
    startTransition(async () => {
      try {
        const { deleteModelRecord } = await import('@/lib/actions/crud')
        await deleteModelRecord(modelName, id)
        router.refresh()
      } catch (error) {
        console.error('Failed to delete:', error)
        alert('Failed to delete item')
      } finally {
        setDeletingId(null)
      }
    })
  }

  const renderSortIcon = (columnKey: string) => {
    if (columnKey !== orderBy) return <ArrowUpDown className="h-4 w-4" />
    return order === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  const renderCellValue = (value: any, column: DataTableColumn): React.ReactNode => {
    if (value === null || value === undefined) return '-'
    
    // Use RelationField for relation columns with full metadata
    if (column.isRelation && column.field) {
      return (
        <RelationField
          field={column.field}
          value={value}
          modelName={modelName || ''}
        />
      )
    }
    
    // Fallback for relations without full metadata (backward compatibility)
    if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      if (column.isRelation && column.relationTo && value.id) {
        // Create a minimal field object for backward compatibility
        const field: AdminField = {
          id: `${modelName}.${column.key}`,
          name: column.key,
          title: column.label,
          type: column.relationTo,
          kind: 'object',
          list: column.isList || false,
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
          // Default display settings
          relationDisplayMode: 'dropdown',
          relationActions: {
            filter: true,
            view: true,
            edit: true,
            viewAll: true
          }
        }
        
        return (
          <RelationField
            field={field}
            value={value}
            modelName={modelName || ''}
          />
        )
      }
      return value.id || '-'
    }
    
    switch (column.type) {
      case 'boolean':
        return value ? '✓' : '✗'
      case 'date':
      case 'datetime':
        return value instanceof Date 
          ? value.toLocaleDateString() 
          : new Date(value).toLocaleDateString()
      case 'json':
        return <code className="text-xs">{JSON.stringify(value)}</code>
      case 'custom':
        // Handle arrays that might be relations
        if (Array.isArray(value) && column.isRelation && column.field) {
          return (
            <RelationField
              field={column.field}
              value={value}
              modelName={modelName || ''}
            />
          )
        }
        // Fallback for arrays without full metadata
        if (Array.isArray(value)) {
          if (column.relationTo) {
            // Create minimal field for backward compatibility
            const field: AdminField = {
              id: `${modelName}.${column.key}`,
              name: column.key,
              title: column.label,
              type: column.relationTo,
              kind: 'object',
              list: true,
              required: false,
              isId: false,
              unique: false,
              order: 0,
              relationField: true,
              read: true,
              filter: true,
              sort: false,
              create: false,
              update: false,
              editor: false,
              upload: false,
              // Default display settings for many-to-many
              relationDisplayMode: 'tags',
              relationActions: {
                filter: true,
                viewAll: true
              }
            }
            
            return (
              <RelationField
                field={field}
                value={value}
                modelName={modelName || ''}
              />
            )
          }
          return value.map(v => v.id || v).join(', ')
        }
        return value.toString()
      default:
        if (Array.isArray(value)) {
          return value.map(v => v.id || v).join(', ')
        }
        return value.toString()
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(data.map(row => row.id))
      setSelectedRows(allIds)
    } else {
      setSelectedRows(new Set())
    }
  }

  const handleSelectRow = (id: string | number, checked: boolean) => {
    const newSelection = new Set(selectedRows)
    if (checked) {
      newSelection.add(id)
    } else {
      newSelection.delete(id)
    }
    setSelectedRows(newSelection)
  }

  const isAllSelected = data.length > 0 && data.every(row => selectedRows.has(row.id))
  const isIndeterminate = data.some(row => selectedRows.has(row.id)) && !isAllSelected

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearch} className="flex flex-1 items-center gap-2 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>
        
        {filterFields && filterFields.length > 0 && (
          <FilterPanel 
            fields={filterFields} 
            modelName={modelName || ''}
            getRelationFields={getRelationFields}
          />
        )}
      </div>

      {enableBulkActions && selectedRows.size > 0 && modelName && (
        <BulkActions
          selectedCount={selectedRows.size}
          selectedIds={Array.from(selectedRows)}
          modelName={modelName}
          onClearSelection={() => setSelectedRows(new Set())}
        />
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {enableBulkActions && (canDelete || modelName) && (
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={isAllSelected || isIndeterminate}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead key={column.key}>
                  {column.sortable ? (
                    <Button
                      variant="ghost"
                      onClick={() => handleSort(column.key)}
                      className="-ml-3 h-8 data-[state=open]:bg-accent"
                    >
                      <span>{column.label}</span>
                      <span className="ml-2">
                        {renderSortIcon(column.key)}
                      </span>
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
                  colSpan={columns.length + (canEdit || canDelete ? 1 : 0) + (enableBulkActions ? 1 : 0)} 
                  className="h-24 text-center text-muted-foreground"
                >
                  No results found
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow key={row.id} data-state={selectedRows.has(row.id) ? "selected" : undefined}>
                  {enableBulkActions && (canDelete || modelName) && (
                    <TableCell className={compact ? "py-2" : ""}>
                      <Checkbox
                        checked={selectedRows.has(row.id)}
                        onCheckedChange={(checked) => handleSelectRow(row.id, checked as boolean)}
                        aria-label={`Select row ${row.id}`}
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell key={column.key} className={compact ? "py-2" : ""}>
                      {renderCellValue(row[column.key], column)}
                    </TableCell>
                  ))}
                  {(canEdit || canDelete) && (
                    <TableCell className={compact ? "py-2" : ""}>
                      <div className="flex items-center gap-1">
                        {canEdit && modelName && (
                          <Link href={`/admin/${modelName.toLowerCase()}/${row.id}`}>
                            <Button variant="ghost" size={compact ? "sm" : "icon"} className={compact ? "h-7 w-7" : ""}>
                              <Edit className={compact ? "h-3 w-3" : "h-4 w-4"} />
                            </Button>
                          </Link>
                        )}
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size={compact ? "sm" : "icon"}
                            className={compact ? "h-7 w-7" : ""}
                            onClick={() => handleDelete(row.id)}
                            disabled={deletingId === row.id}
                          >
                            <Trash2 className={compact ? "h-3 w-3" : "h-4 w-4"} />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => updateUrl({ page: 1 })}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => updateUrl({ page: currentPage - 1 })}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => updateUrl({ page: currentPage + 1 })}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => updateUrl({ page: totalPages })}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}