'use client'

import { useState, useEffect } from 'react'
import { FilterConfig, FilterOperator, FilterValue, getOperatorLabel, getOperatorsForType, needsValue } from './types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Check } from 'lucide-react'

interface BaseFilterProps {
  config: FilterConfig
  value?: FilterValue
  onChange: (value: FilterValue | null) => void
  renderInput: (operator: FilterOperator, value: any, onChange: (value: any) => void) => React.ReactNode
}

export function BaseFilter({ config, value, onChange, renderInput }: BaseFilterProps) {
  const [operator, setOperator] = useState<FilterOperator>(value?.operator || 'equals')
  const [filterValue, setFilterValue] = useState<any>(value?.value ?? '')
  
  const operators = getOperatorsForType(config.type, config.kind)
  const showValue = needsValue(operator)
  const isFilterReady = !showValue || (filterValue !== '' && filterValue !== null && filterValue !== undefined && (!Array.isArray(filterValue) || filterValue.length > 0))
  
  const handleOperatorChange = (newOperator: FilterOperator) => {
    setOperator(newOperator)
    
    // For operators that don't need a value, save immediately
    if (!needsValue(newOperator)) {
      onChange({
        field: config.field,
        operator: newOperator,
        value: null,
        type: config.type
      })
    } else if (filterValue !== '' && filterValue !== null && filterValue !== undefined) {
      // If we have a value, update with new operator
      if (!Array.isArray(filterValue) || filterValue.length > 0) {
        onChange({
          field: config.field,
          operator: newOperator,
          value: filterValue,
          type: config.type
        })
      }
    }
  }
  
  const handleValueChange = (newValue: any) => {
    setFilterValue(newValue)
    
    // Save the filter when value changes
    if (newValue !== '' && newValue !== null && newValue !== undefined) {
      if (!Array.isArray(newValue) || newValue.length > 0) {
        onChange({
          field: config.field,
          operator,
          value: newValue,
          type: config.type
        })
      }
    }
  }
  
  const handleClear = () => {
    setOperator('equals')
    setFilterValue('')
    onChange(null)
  }
  
  return (
    <div className="space-y-3 p-4 bg-muted/30 rounded-lg border relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold">{config.label}</h4>
          {isFilterReady && (
            <Badge variant="secondary" className="h-5 px-1.5">
              <Check className="h-3 w-3" />
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
          onClick={handleClear}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <Select value={operator} onValueChange={handleOperatorChange}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {operators.map(op => (
            <SelectItem key={op} value={op}>
              {getOperatorLabel(op)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {showValue && (
        <div className="space-y-2">
          {renderInput(operator, filterValue, handleValueChange)}
        </div>
      )}
    </div>
  )
}