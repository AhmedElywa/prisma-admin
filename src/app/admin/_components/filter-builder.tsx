'use client'

import { useState } from 'react'
import { AdminField, FilterOperator } from '@/lib/admin/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, X, Filter } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

interface FilterBuilderProps {
  fields: AdminField[]
  modelName: string
}

interface FilterItem {
  field: string
  operator: FilterOperator
  value: string
}

const operatorLabels: Record<FilterOperator, string> = {
  equals: 'Equals',
  not: 'Not equals',
  in: 'In',
  notIn: 'Not in',
  lt: 'Less than',
  lte: 'Less than or equal',
  gt: 'Greater than',
  gte: 'Greater than or equal',
  contains: 'Contains',
  startsWith: 'Starts with',
  endsWith: 'Ends with',
}

const getOperatorsForType = (type: string): FilterOperator[] => {
  switch (type) {
    case 'String':
      return ['equals', 'not', 'contains', 'startsWith', 'endsWith']
    case 'Int':
    case 'BigInt':
    case 'Float':
    case 'Decimal':
      return ['equals', 'not', 'lt', 'lte', 'gt', 'gte']
    case 'Boolean':
      return ['equals', 'not']
    case 'DateTime':
      return ['equals', 'not', 'lt', 'lte', 'gt', 'gte']
    default:
      return ['equals', 'not']
  }
}

export function FilterBuilder({ fields, modelName }: FilterBuilderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState<FilterItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  
  const filterableFields = fields.filter(f => f.filter)
  
  const addFilter = () => {
    const firstField = filterableFields[0]
    if (firstField) {
      setFilters([...filters, {
        field: firstField.name,
        operator: 'equals',
        value: ''
      }])
    }
  }
  
  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index))
  }
  
  const updateFilter = (index: number, updates: Partial<FilterItem>) => {
    const newFilters = [...filters]
    newFilters[index] = { ...newFilters[index], ...updates }
    setFilters(newFilters)
  }
  
  const applyFilters = () => {
    const params = new URLSearchParams(searchParams)
    
    // Clear existing filter params
    Array.from(params.keys()).forEach(key => {
      if (key.startsWith('filter_')) {
        params.delete(key)
      }
    })
    
    // Add new filters
    filters.forEach((filter, index) => {
      if (filter.value) {
        params.set(`filter_${filter.field}_${filter.operator}`, filter.value)
      }
    })
    
    // Reset to page 1 when filtering
    params.set('page', '1')
    
    router.push(`?${params.toString()}`)
    setIsOpen(false)
  }
  
  const clearFilters = () => {
    const params = new URLSearchParams(searchParams)
    
    // Clear all filter params
    Array.from(params.keys()).forEach(key => {
      if (key.startsWith('filter_')) {
        params.delete(key)
      }
    })
    
    router.push(`?${params.toString()}`)
    setFilters([])
    setIsOpen(false)
  }
  
  const activeFilterCount = Array.from(searchParams.keys()).filter(key => 
    key.startsWith('filter_')
  ).length
  
  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <Filter className="h-4 w-4" />
        Filters
        {activeFilterCount > 0 && (
          <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
            {activeFilterCount}
          </span>
        )}
      </Button>
    )
  }
  
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Filter {modelName}</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {filters.map((filter, index) => {
          const field = filterableFields.find(f => f.name === filter.field)
          const operators = field ? getOperatorsForType(field.type) : []
          
          return (
            <div key={index} className="flex gap-2">
              <Select
                value={filter.field}
                onValueChange={(value) => updateFilter(index, { field: value })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {filterableFields.map(f => (
                    <SelectItem key={f.name} value={f.name}>
                      {f.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={filter.operator}
                onValueChange={(value) => updateFilter(index, { operator: value as FilterOperator })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {operators.map(op => (
                    <SelectItem key={op} value={op}>
                      {operatorLabels[op]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Input
                value={filter.value}
                onChange={(e) => updateFilter(index, { value: e.target.value })}
                placeholder="Value"
                className="flex-1"
              />
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFilter(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )
        })}
        
        <Button
          variant="outline"
          size="sm"
          onClick={addFilter}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Filter
        </Button>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={clearFilters}>
            Clear All
          </Button>
          <Button onClick={applyFilters}>
            Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}