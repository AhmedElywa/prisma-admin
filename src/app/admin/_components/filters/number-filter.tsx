'use client'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { BaseFilter } from './base-filter'
import { FilterConfig, FilterOperator, FilterValue, isMultiValue } from './types'

interface NumberFilterProps {
  config: FilterConfig
  value?: FilterValue
  onChange: (value: FilterValue | null) => void
}

export function NumberFilter({ config, value, onChange }: NumberFilterProps) {
  const renderInput = (operator: FilterOperator, value: any, onChange: (value: any) => void) => {
    if (isMultiValue(operator)) {
      return (
        <Textarea
          placeholder="Enter numbers separated by commas"
          value={Array.isArray(value) ? value.join(', ') : value}
          onChange={(e) => {
            const values = e.target.value
              .split(',')
              .map(v => v.trim())
              .filter(v => v && !isNaN(Number(v)))
              .map(v => {
                if (config.type === 'Float' || config.type === 'Decimal') {
                  return parseFloat(v)
                }
                return parseInt(v)
              })
            onChange(values)
          }}
          className="min-h-[80px]"
        />
      )
    }
    
    const inputType = config.type === 'Float' || config.type === 'Decimal' ? 'number' : 'number'
    const step = config.type === 'Float' || config.type === 'Decimal' ? '0.01' : '1'
    
    return (
      <Input
        type={inputType}
        step={step}
        placeholder={`Enter ${config.label.toLowerCase()}`}
        value={value || ''}
        onChange={(e) => {
          const val = e.target.value
          if (val === '') {
            onChange('')
          } else if (config.type === 'Float' || config.type === 'Decimal') {
            onChange(parseFloat(val))
          } else {
            onChange(parseInt(val))
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