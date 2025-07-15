'use client'

import { AdminField } from '@/lib/admin/types'
import { RelationDropdown } from './RelationDropdown'
import { TagList } from './TagList'
import { RelationCount } from './RelationCount'
import { RelationInline } from './RelationInline'
import { RelationLink } from './RelationLink'
import { RelationBadge } from './RelationBadge'

export interface RelationFieldProps {
  field: AdminField
  value: any
  modelName: string
  onFilter?: (field: string, value: any) => void
  onNavigate?: (model: string, id: string | number) => void
  onPreview?: (model: string, id: string | number) => void
}

export function RelationField({
  field,
  value,
  modelName,
  onFilter,
  onNavigate,
  onPreview
}: RelationFieldProps) {
  // Handle null/undefined values
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">-</span>
  }

  // Get display mode from field settings or default to 'link'
  const displayMode = field.relationDisplayMode || 'link'
  
  // Common props for all sub-components
  const commonProps = {
    field,
    value,
    modelName,
    onFilter,
    onNavigate,
    onPreview
  }

  // Render based on display mode
  switch (displayMode) {
    case 'dropdown':
      return <RelationDropdown {...commonProps} />
      
    case 'tags':
      return <TagList {...commonProps} />
      
    case 'count':
      return <RelationCount {...commonProps} />
      
    case 'inline':
      return <RelationInline {...commonProps} />
      
    case 'badge':
      return <RelationBadge {...commonProps} />
      
    case 'link':
    default:
      return <RelationLink {...commonProps} />
  }
}

// Helper function to get display value from a relation object
export function getRelationDisplayValue(
  item: any,
  previewFields?: string[]
): string {
  if (!item || typeof item !== 'object') {
    return String(item)
  }

  // If preview fields are specified, use them
  if (previewFields && previewFields.length > 0) {
    const values = previewFields
      .map(field => item[field])
      .filter(Boolean)
    
    if (values.length > 0) {
      return values.join(' - ')
    }
  }

  // Default fallback order
  return (
    item.name ||
    item.title ||
    item.label ||
    item.email ||
    item.username ||
    item.id ||
    'Unknown'
  )
}

// Helper to check if we should show an action
export function shouldShowAction(
  field: AdminField,
  action: keyof NonNullable<AdminField['relationActions']>
): boolean {
  return field.relationActions?.[action] !== false
}