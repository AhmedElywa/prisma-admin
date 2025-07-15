'use client'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { BaseFilter } from './base-filter'
import { FilterConfig, FilterOperator, FilterValue } from './types'

interface JsonFilterProps {
  config: FilterConfig
  value?: FilterValue
  onChange: (value: FilterValue | null) => void
}

export function JsonFilter({ config, value, onChange }: JsonFilterProps) {
  const renderInput = (operator: FilterOperator, value: any, onChange: (value: any) => void) => {
    // For JSON string operations
    if (operator.startsWith('string_')) {
      return (
        <Input
          type="text"
          placeholder="Enter text to search in JSON"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      )
    }
    
    // For array operations or equals/not
    if (operator.startsWith('array_') || operator === 'equals' || operator === 'not') {
      return (
        <Textarea
          placeholder="Enter valid JSON"
          value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value)
              onChange(parsed)
            } catch {
              // Keep as string if invalid JSON
              onChange(e.target.value)
            }
          }}
          className="min-h-[120px] font-mono text-sm"
        />
      )
    }
    
    // For comparison operators (lt, lte, gt, gte)
    return (
      <Input
        type="text"
        placeholder="Enter value for comparison"
        value={value || ''}
        onChange={(e) => {
          // Try to parse as number first
          const num = Number(e.target.value)
          if (!isNaN(num)) {
            onChange(num)
          } else {
            onChange(e.target.value)
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