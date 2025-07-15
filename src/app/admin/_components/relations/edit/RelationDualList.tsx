'use client'

import { useState, useEffect } from 'react'
import { ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AdminField } from '@/lib/admin/types'
import { cn } from '@/lib/utils'

interface RelationDualListProps {
  name: string
  label: string
  value?: any[]
  required?: boolean
  disabled?: boolean
  placeholder?: string
  relatedModel: string
  field: AdminField
}

export function RelationDualList({
  name,
  label,
  value = [],
  required,
  disabled,
  relatedModel,
  field,
}: RelationDualListProps) {
  const [selectedItems, setSelectedItems] = useState<any[]>([])
  const [availableItems, setAvailableItems] = useState<any[]>([])
  const [selectedHighlight, setSelectedHighlight] = useState<Set<string>>(new Set())
  const [availableHighlight, setAvailableHighlight] = useState<Set<string>>(new Set())
  const [selectedSearch, setSelectedSearch] = useState('')
  const [availableSearch, setAvailableSearch] = useState('')
  const [loading, setLoading] = useState(true)
  
  // Get display fields from relation options
  const displayFields = field.relationEditOptions?.previewFields || ['id', 'name', 'title']
  const pageSize = field.relationEditOptions?.pageSize || 100
  
  // Initialize data
  useEffect(() => {
    loadAllData()
  }, [])
  
  async function loadAllData() {
    setLoading(true)
    try {
      // Load all available options
      const params = new URLSearchParams({
        model: relatedModel,
        page: '1',
        perPage: pageSize.toString(),
      })
      
      const response = await fetch(`/api/admin/data?${params}`)
      if (response.ok) {
        const data = await response.json()
        const allOptions = data.data || []
        
        // Separate selected and available based on current value
        const selectedIds = new Set(
          (value || []).map(item => 
            typeof item === 'object' ? item.id : item
          ).filter(Boolean)
        )
        
        const selected: any[] = []
        const available: any[] = []
        
        allOptions.forEach((option: any) => {
          if (selectedIds.has(option.id)) {
            selected.push(option)
          } else {
            available.push(option)
          }
        })
        
        setSelectedItems(selected)
        setAvailableItems(available)
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
  
  function moveToSelected(items?: any[]) {
    const toMove = items || availableItems.filter(item => 
      availableHighlight.has(item.id.toString())
    )
    
    setSelectedItems([...selectedItems, ...toMove])
    setAvailableItems(availableItems.filter(item => 
      !toMove.some(m => m.id === item.id)
    ))
    setAvailableHighlight(new Set())
  }
  
  function moveToAvailable(items?: any[]) {
    const toMove = items || selectedItems.filter(item => 
      selectedHighlight.has(item.id.toString())
    )
    
    setAvailableItems([...availableItems, ...toMove])
    setSelectedItems(selectedItems.filter(item => 
      !toMove.some(m => m.id === item.id)
    ))
    setSelectedHighlight(new Set())
  }
  
  function toggleHighlight(id: string, list: 'selected' | 'available') {
    const setHighlight = list === 'selected' ? setSelectedHighlight : setAvailableHighlight
    
    setHighlight(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }
  
  function filterItems(items: any[], search: string) {
    if (!search) return items
    
    const searchLower = search.toLowerCase()
    return items.filter(item => {
      const display = getDisplayValue(item).toLowerCase()
      return display.includes(searchLower)
    })
  }
  
  const filteredAvailable = filterItems(availableItems, availableSearch)
  const filteredSelected = filterItems(selectedItems, selectedSearch)
  
  if (loading) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="h-[400px] bg-muted animate-pulse rounded" />
      </div>
    )
  }
  
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <div className="grid grid-cols-[1fr,auto,1fr] gap-4">
        {/* Available list */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium">Available</h4>
            <span className="text-xs text-muted-foreground">({filteredAvailable.length})</span>
          </div>
          
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={availableSearch}
              onChange={(e) => setAvailableSearch(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
          
          <div className="border rounded-md h-[300px] overflow-y-auto">
            {filteredAvailable.map(item => {
              const id = item.id.toString()
              const isHighlighted = availableHighlight.has(id)
              
              return (
                <div
                  key={id}
                  className={cn(
                    "px-3 py-2 cursor-pointer hover:bg-muted/50",
                    isHighlighted && "bg-muted"
                  )}
                  onClick={() => toggleHighlight(id, 'available')}
                >
                  {getDisplayValue(item)}
                </div>
              )
            })}
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex flex-col justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => moveToSelected()}
            disabled={disabled || availableHighlight.size === 0}
            title="Move selected"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => moveToSelected(availableItems)}
            disabled={disabled || availableItems.length === 0}
            title="Move all"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => moveToAvailable()}
            disabled={disabled || selectedHighlight.size === 0}
            title="Remove selected"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => moveToAvailable(selectedItems)}
            disabled={disabled || selectedItems.length === 0}
            title="Remove all"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Selected list */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium">Selected</h4>
            <span className="text-xs text-muted-foreground">({filteredSelected.length})</span>
          </div>
          
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={selectedSearch}
              onChange={(e) => setSelectedSearch(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
          
          <div className="border rounded-md h-[300px] overflow-y-auto">
            {filteredSelected.map(item => {
              const id = item.id.toString()
              const isHighlighted = selectedHighlight.has(id)
              
              return (
                <div
                  key={id}
                  className={cn(
                    "px-3 py-2 cursor-pointer hover:bg-muted/50",
                    isHighlighted && "bg-muted"
                  )}
                  onClick={() => toggleHighlight(id, 'selected')}
                >
                  {getDisplayValue(item)}
                </div>
              )
            })}
          </div>
        </div>
      </div>
      
      {/* Hidden inputs for form submission */}
      {selectedItems.map(item => (
        <input
          key={item.id}
          type="hidden"
          name={`${name}[]`}
          value={item.id}
        />
      ))}
      
      {/* Empty input for when no items selected */}
      {selectedItems.length === 0 && (
        <input
          type="hidden"
          name={`${name}[]`}
          value=""
        />
      )}
    </div>
  )
}