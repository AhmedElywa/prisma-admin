'use client'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { BaseFilter } from './base-filter'
import { FilterConfig, FilterOperator, FilterValue, isMultiValue } from './types'

interface DateTimeFilterProps {
  config: FilterConfig
  value?: FilterValue
  onChange: (value: FilterValue | null) => void
}

export function DateTimeFilter({ config, value, onChange }: DateTimeFilterProps) {
  const renderInput = (operator: FilterOperator, value: any, onChange: (value: any) => void) => {
    if (isMultiValue(operator)) {
      return (
        <Textarea
          placeholder="Enter dates separated by commas (YYYY-MM-DD)"
          value={Array.isArray(value) ? value.map(v => new Date(v).toISOString().split('T')[0]).join(', ') : value}
          onChange={(e) => {
            const values = e.target.value
              .split(',')
              .map(v => v.trim())
              .filter(v => v)
              .map(v => new Date(v).toISOString())
            onChange(values)
          }}
          className="min-h-[80px]"
        />
      )
    }
    
    // Format date for input
    const formatDateForInput = (date: any) => {
      if (!date) return ''
      try {
        return new Date(date).toISOString().slice(0, 16)
      } catch {
        return ''
      }
    }
    
    return (
      <Input
        type="datetime-local"
        value={formatDateForInput(value)}
        onChange={(e) => {
          if (e.target.value) {
            onChange(new Date(e.target.value).toISOString())
          } else {
            onChange('')
          }
        }}
      />
    )
  }
  
  return (
    <BaseFilter
      config={config}
      value={value}
      onChange={onChange}
      renderInput={renderInput}
    />
  )
}