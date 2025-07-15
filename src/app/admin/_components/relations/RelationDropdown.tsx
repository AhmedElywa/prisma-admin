'use client'

import { ChevronDown, Filter, Edit, Eye, List } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { RelationFieldProps, getRelationDisplayValue, shouldShowAction } from './RelationField'

export function RelationDropdown({
  field,
  value,
  modelName,
  onFilter,
  onNavigate,
  onPreview
}: RelationFieldProps) {
  const router = useRouter()
  const displayValue = getRelationDisplayValue(value, field.relationEditOptions?.previewFields)
  const relationModel = field.type.toLowerCase()

  const handleFilter = () => {
    if (onFilter && field.relationFrom) {
      onFilter(field.relationFrom, value.id)
    } else if (field.relationFrom) {
      // Default filter implementation using URL params
      const params = new URLSearchParams(window.location.search)
      params.set('filters', JSON.stringify([{
        field: field.relationFrom,
        operator: 'equals',
        value: value.id
      }]))
      router.push(`/admin/${modelName}?${params.toString()}`)
    }
  }

  const handleView = () => {
    if (onNavigate) {
      onNavigate(relationModel, value.id)
    } else {
      router.push(`/admin/${relationModel}/${value.id}`)
    }
  }

  const handleEdit = () => {
    router.push(`/admin/${relationModel}/${value.id}/edit`)
  }

  const handleViewAll = () => {
    // Navigate to related model filtered by this relation
    const filterField = modelName.toLowerCase() + 'Id'
    const params = new URLSearchParams()
    params.set('filters', JSON.stringify([{
      field: filterField,
      operator: 'equals',
      value: value.id
    }]))
    router.push(`/admin/${relationModel}?${params.toString()}`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-auto p-1 font-normal hover:bg-muted"
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
  )
}