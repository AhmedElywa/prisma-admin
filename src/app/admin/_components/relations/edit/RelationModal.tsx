'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { AdminField } from '@/lib/admin/types'
import { Badge } from '@/components/ui/badge'
import { Edit } from 'lucide-react'

interface RelationModalProps {
  name: string
  label: string
  value?: any
  required?: boolean
  disabled?: boolean
  placeholder?: string
  relatedModel: string
  field: AdminField
  modelId?: string
  modelName?: string
}

export function RelationModal({
  name,
  label,
  value,
  required,
  disabled,
  placeholder,
  relatedModel,
  field,
}: RelationModalProps) {
  const [selectedValue, setSelectedValue] = useState<any>(value)
  
  // Get display fields from relation options
  const displayFields = field.relationEditOptions?.previewFields || ['id', 'name', 'title']
  
  function getDisplayValue(record: any): string {
    if (!record) return ''
    
    if (Array.isArray(record)) {
      return `${record.length} items selected`
    }
    
    // Try each display field in order
    for (const field of displayFields) {
      if (record[field]) {
        return String(record[field])
      }
    }
    
    // Fallback to ID
    return record.id?.toString() || ''
  }
  
  function handleOpenModal() {
    // TODO: Implement modal opening logic
    // This would open a modal with a full table/list view of the related model
    // For now, just console log
    console.log('Opening modal for', relatedModel)
  }
  
  const displayValue = selectedValue ? getDisplayValue(selectedValue) : ''
  
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <div className="flex items-center gap-2">
        {displayValue ? (
          <Badge variant="secondary" className="max-w-[300px] truncate">
            {displayValue}
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground">
            {placeholder || 'No selection'}
          </span>
        )}
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleOpenModal}
          disabled={disabled}
        >
          <Edit className="h-4 w-4 mr-1" />
          {displayValue ? 'Change' : 'Select'}
        </Button>
      </div>
      
      {/* Hidden input for form submission */}
      <input
        type="hidden"
        name={name}
        value={
          selectedValue
            ? Array.isArray(selectedValue)
              ? selectedValue.map(v => v.id).join(',')
              : selectedValue.id || ''
            : ''
        }
        required={required}
      />
      
      {/* Note for future implementation */}
      <p className="text-xs text-muted-foreground">
        Modal selection coming soon. Use tags or dual list mode for now.
      </p>
    </div>
  )
}