'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Filter, X } from 'lucide-react'
import { FilterConfig, FilterValue } from './types'
import { FilterGroup } from './filter-group'
import { useRouter, useSearchParams } from 'next/navigation'

interface FilterPanelProps {
  fields: FilterConfig[]
  modelName: string
  getRelationFields?: (modelName: string) => Promise<FilterConfig[]>
}

export function FilterPanel({ fields, modelName, getRelationFields }: FilterPanelProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  
  // Parse filters from URL
  const urlFilters = searchParams.get('filters')
  const currentFilters: FilterValue[] = urlFilters ? JSON.parse(decodeURIComponent(urlFilters)) : []
  
  const [tempFilters, setTempFilters] = useState<FilterValue[]>(currentFilters)
  
  // Check if filters have changed
  const hasChanges = JSON.stringify(tempFilters) !== JSON.stringify(currentFilters)
  
  const handleApplyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (tempFilters.length > 0) {
      params.set('filters', encodeURIComponent(JSON.stringify(tempFilters)))
    } else {
      params.delete('filters')
    }
    
    // Reset to page 1 when filters change
    params.set('page', '1')
    
    router.push(`?${params.toString()}`)
    setIsOpen(false)
  }
  
  const handleClearFilters = () => {
    setTempFilters([])
    const params = new URLSearchParams(searchParams.toString())
    params.delete('filters')
    params.set('page', '1')
    router.push(`?${params.toString()}`)
  }
  
  const handleRemoveFilter = (index: number) => {
    const newFilters = currentFilters.filter((_, i) => i !== index)
    const params = new URLSearchParams(searchParams.toString())
    
    if (newFilters.length > 0) {
      params.set('filters', encodeURIComponent(JSON.stringify(newFilters)))
    } else {
      params.delete('filters')
    }
    
    params.set('page', '1')
    router.push(`?${params.toString()}`)
  }
  
  const getFilterLabel = (filter: FilterValue) => {
    const field = fields.find(f => f.field === filter.field)
    if (!field) return filter.field
    
    let label = `${field.label} `
    
    switch (filter.operator) {
      case 'equals': label += '='; break
      case 'not': label += '≠'; break
      case 'contains': label += 'contains'; break
      case 'startsWith': label += 'starts with'; break
      case 'endsWith': label += 'ends with'; break
      case 'lt': label += '<'; break
      case 'lte': label += '≤'; break
      case 'gt': label += '>'; break
      case 'gte': label += '≥'; break
      case 'in': label += 'in'; break
      case 'notIn': label += 'not in'; break
      case 'isNull': return `${field.label} is empty`
      case 'isNotNull': return `${field.label} is not empty`
      case 'is': label += 'is'; break
      case 'isNot': label += 'is not'; break
      case 'every': label += 'all match'; break
      case 'some': label += 'any match'; break
      case 'none': label += 'none match'; break
      default: label += filter.operator
    }
    
    if (filter.value !== null && filter.value !== undefined) {
      if (Array.isArray(filter.value)) {
        label += ` [${filter.value.length} items]`
      } else if (typeof filter.value === 'object') {
        label += ' ...'
      } else {
        label += ` ${filter.value}`
      }
    }
    
    return label
  }
  
  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {currentFilters.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {currentFilters.length}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[540px] flex flex-col">
            <SheetHeader className="space-y-1">
              <SheetTitle>Filter {modelName}</SheetTitle>
              <p className="text-sm text-muted-foreground">
                Add filters to refine your search results
              </p>
            </SheetHeader>
            
            <div className="flex-1 overflow-y-auto py-6">
              <FilterGroup
                fields={fields}
                filters={tempFilters}
                onChange={setTempFilters}
                getRelationFields={getRelationFields}
              />
            </div>
            
            <div className="border-t pt-4 pb-2 space-y-2">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setTempFilters([])}
                  disabled={tempFilters.length === 0}
                  className="flex-1"
                >
                  Clear All
                </Button>
                <Button
                  onClick={handleApplyFilters}
                  className="flex-1"
                  disabled={!hasChanges}
                >
                  {hasChanges 
                    ? `Apply ${tempFilters.length > 0 ? `(${tempFilters.length})` : 'Changes'}`
                    : 'No Changes'
                  }
                </Button>
              </div>
              {hasChanges && (
                <p className="text-xs text-muted-foreground text-center">
                  {tempFilters.length === 0 && currentFilters.length > 0
                    ? 'All filters will be cleared'
                    : tempFilters.length > currentFilters.length 
                      ? `${tempFilters.length - currentFilters.length} new filter${tempFilters.length - currentFilters.length > 1 ? 's' : ''} to apply`
                      : currentFilters.length > tempFilters.length
                        ? `${currentFilters.length - tempFilters.length} filter${currentFilters.length - tempFilters.length > 1 ? 's' : ''} to remove`
                        : 'Filters have been modified'
                  }
                </p>
              )}
            </div>
          </SheetContent>
        </Sheet>
        
        {currentFilters.length > 0 && (
          <>
            <div className="flex items-center gap-2 flex-wrap">
              {currentFilters.map((filter, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  <span className="text-xs">{getFilterLabel(filter)}</span>
                  <button
                    onClick={() => handleRemoveFilter(index)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-xs"
            >
              Clear all
            </Button>
          </>
        )}
      </div>
    </>
  )
}