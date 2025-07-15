'use client'

import { useState, useEffect } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { AdminField } from '@/lib/admin/types'
import { Loader2 } from 'lucide-react'

interface RelationCheckboxProps {
  name: string
  label: string
  value?: any[]
  required?: boolean
  disabled?: boolean
  placeholder?: string
  relatedModel: string
  field: AdminField
}

export function RelationCheckbox({
  name,
  label,
  value = [],
  required,
  disabled,
  relatedModel,
  field,
}: RelationCheckboxProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [options, setOptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Get display fields from relation options
  const displayFields = field.relationEditOptions?.previewFields || ['id', 'name', 'title']
  const pageSize = field.relationEditOptions?.pageSize || 100 // Load more for checkbox list
  
  // Initialize selected items from value
  useEffect(() => {
    if (value && Array.isArray(value)) {
      const ids = value.map(item => 
        typeof item === 'object' ? item.id?.toString() : item?.toString()
      ).filter(Boolean)
      setSelectedIds(new Set(ids))
    }
  }, [value])
  
  // Load all options on mount
  useEffect(() => {
    loadOptions()
  }, [])
  
  async function loadOptions() {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        model: relatedModel,
        page: '1',
        perPage: pageSize.toString(),
      })
      
      const response = await fetch(`/api/admin/data?${params}`)
      if (response.ok) {
        const data = await response.json()
        setOptions(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load options:', error)
    } finally {
      setLoading(false)
    }
  }
  
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
  
  function handleToggle(optionId: string) {
    const newSelected = new Set(selectedIds)
    
    if (newSelected.has(optionId)) {
      newSelected.delete(optionId)
    } else {
      newSelected.add(optionId)
    }
    
    setSelectedIds(newSelected)
  }
  
  if (loading) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="ml-2 text-sm text-muted-foreground">Loading options...</span>
        </div>
      </div>
    )
  }
  
  if (options.length === 0) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <p className="text-sm text-muted-foreground">No options available</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <div className="space-y-2 max-h-[300px] overflow-y-auto border rounded-md p-3">
        {options.map(option => {
          const optionId = option.id?.toString() || ''
          const display = getDisplayValue(option)
          const isChecked = selectedIds.has(optionId)
          
          return (
            <div key={optionId} className="flex items-center space-x-2">
              <Checkbox
                id={`${name}-${optionId}`}
                checked={isChecked}
                onCheckedChange={() => handleToggle(optionId)}
                disabled={disabled}
              />
              <Label
                htmlFor={`${name}-${optionId}`}
                className="text-sm font-normal cursor-pointer"
              >
                {display}
              </Label>
            </div>
          )
        })}
      </div>
      
      {/* Hidden inputs for form submission */}
      {Array.from(selectedIds).map(id => (
        <input
          key={id}
          type="hidden"
          name={`${name}[]`}
          value={id}
        />
      ))}
      
      {/* Empty input for when no items selected */}
      {selectedIds.size === 0 && (
        <input
          type="hidden"
          name={`${name}[]`}
          value=""
        />
      )}
    </div>
  )
}