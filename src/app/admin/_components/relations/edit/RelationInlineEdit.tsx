'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { AdminField } from '@/lib/admin/types'
import { Card } from '@/components/ui/card'
import { Plus, X } from 'lucide-react'

interface RelationInlineEditProps {
  name: string
  label: string
  value?: any
  required?: boolean
  disabled?: boolean
  placeholder?: string
  relatedModel: string
  field: AdminField
}

export function RelationInlineEdit({
  name,
  label,
  value,
  required,
  disabled,
  relatedModel,
  field,
}: RelationInlineEditProps) {
  const [selectedValue, setSelectedValue] = useState<any>(value)
  
  // Get display fields from relation options
  const displayFields = field.relationEditOptions?.previewFields || ['id', 'name', 'title']
  
  function getDisplayValue(record: any): string {
    if (!record) return ''
    
    // Try each display field in order
    for (const field of displayFields) {
      if (record[field]) {
        return String(record[field])
      }
    }
    
    // Fallback to ID
    return record.id?.toString() || ''
  }
  
  function handleCreateNew() {
    // TODO: Implement inline creation form
    console.log('Creating new', relatedModel)
  }
  
  function handleRemove() {
    setSelectedValue(null)
  }
  
  const isOneToOne = !field.list
  
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      {isOneToOne && selectedValue ? (
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">{getDisplayValue(selectedValue)}</p>
              <p className="text-xs text-muted-foreground">
                {relatedModel} #{selectedValue.id}
              </p>
            </div>
            {!disabled && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="border-2 border-dashed rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            No {relatedModel.toLowerCase()} connected
          </p>
          {!disabled && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCreateNew}
            >
              <Plus className="h-4 w-4 mr-1" />
              Create New
            </Button>
          )}
        </div>
      )}
      
      {/* Hidden input for form submission */}
      <input
        type="hidden"
        name={name}
        value={selectedValue?.id || ''}
        required={required}
      />
      
      {/* Note for future implementation */}
      <p className="text-xs text-muted-foreground">
        Inline editing coming soon. Use select or autocomplete mode for now.
      </p>
    </div>
  )
}