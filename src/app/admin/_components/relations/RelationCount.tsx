'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { RelationFieldProps, getRelationDisplayValue, shouldShowAction } from './RelationField'

export function RelationCount({
  field,
  value,
  modelName,
  onNavigate
}: RelationFieldProps) {
  const router = useRouter()
  
  // Handle different value formats
  let count = 0
  let items: any[] = []
  
  if (Array.isArray(value)) {
    count = value.length
    items = value
  } else if (typeof value === 'number') {
    count = value
  } else if (value && typeof value === 'object') {
    // Handle Prisma's _count format
    if (value._count) {
      count = value._count[field.name] || 0
    } else if (value[field.name]) {
      count = value[field.name]
    }
  }

  const handleClick = () => {
    if (!shouldShowAction(field, 'viewAll')) return
    
    // Navigate to related model filtered by this record
    const relationModel = field.type.toLowerCase()
    const filterField = modelName.toLowerCase() + 'Id'
    
    // Get the parent record ID from the current URL
    const pathSegments = window.location.pathname.split('/')
    const parentId = pathSegments[pathSegments.length - 1]
    
    if (onNavigate) {
      onNavigate(relationModel, parentId)
    } else {
      const params = new URLSearchParams()
      params.set('filters', JSON.stringify([{
        field: filterField,
        operator: 'equals',
        value: parentId
      }]))
      router.push(`/admin/${relationModel}?${params.toString()}`)
    }
  }

  const previewLimit = 5
  const hasPreview = items.length > 0 && items.length <= previewLimit

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`h-auto p-1 font-normal ${
              shouldShowAction(field, 'viewAll') ? 'hover:bg-muted cursor-pointer' : 'cursor-default'
            }`}
            onClick={handleClick}
            disabled={!shouldShowAction(field, 'viewAll')}
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
              <div className="font-medium mb-1">
                {field.title || field.name} ({count})
              </div>
              <div className="text-sm space-y-1">
                {items.map((item, index) => (
                  <div key={item.id || index} className="text-muted-foreground">
                    • {getRelationDisplayValue(item, field.relationEditOptions?.previewFields)}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {shouldShowAction(field, 'viewAll') 
                ? `Click to view all ${count} ${field.title || field.name}`
                : `${count} ${field.title || field.name}`
              }
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}