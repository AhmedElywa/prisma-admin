'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { RelationFieldProps, getRelationDisplayValue, shouldShowAction } from './RelationField'

export function RelationLink({
  field,
  value,
  modelName,
  onNavigate
}: RelationFieldProps) {
  const router = useRouter()
  const relationModel = field.type.toLowerCase()
  
  // Handle array values (show as comma-separated links)
  if (Array.isArray(value)) {
    return (
      <div className="inline-flex flex-wrap gap-1">
        {value.map((item, index) => (
          <span key={item.id}>
            {index > 0 && <span className="text-muted-foreground">, </span>}
            <Link
              href={`/admin/${relationModel}/${item.id}`}
              className="text-primary hover:underline"
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault()
                  onNavigate(relationModel, item.id)
                }
              }}
            >
              {getRelationDisplayValue(item, field.relationEditOptions?.previewFields)}
            </Link>
          </span>
        ))}
      </div>
    )
  }
  
  // Handle single value
  const displayValue = getRelationDisplayValue(value, field.relationEditOptions?.previewFields)
  
  return (
    <Link
      href={`/admin/${relationModel}/${value.id}`}
      className="text-primary hover:underline"
      onClick={(e) => {
        if (onNavigate) {
          e.preventDefault()
          onNavigate(relationModel, value.id)
        }
      }}
    >
      {displayValue}
    </Link>
  )
}

// Legacy component for backward compatibility
interface LegacyRelationLinkProps {
  modelName: string
  relationModel: string
  relationId: string | number
  displayValue: string
  filterField?: string
}

export function LegacyRelationLink({
  modelName,
  relationModel,
  relationId,
  displayValue,
  filterField
}: LegacyRelationLinkProps) {
  const field = {
    name: filterField || '',
    type: relationModel,
    relationFrom: filterField,
    relationActions: {
      filter: !!filterField,
      view: true,
      edit: true,
      viewAll: true
    }
  } as any

  return (
    <RelationDropdown
      field={field}
      value={{ id: relationId, name: displayValue }}
      modelName={modelName}
    />
  )
}

// Import RelationDropdown for legacy support
import { RelationDropdown } from './RelationDropdown'