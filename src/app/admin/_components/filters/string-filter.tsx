'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BaseFilter } from './base-filter'
import { FilterConfig, FilterOperator, FilterValue, isMultiValue } from './types'

interface StringFilterProps {
  config: FilterConfig
  value?: FilterValue
  onChange: (value: FilterValue | null) => void
}

export function StringFilter({ config, value, onChange }: StringFilterProps) {
  const [mode, setMode] = useState<'default' | 'insensitive' | 'sensitive'>(value?.mode || 'insensitive')
  
  const renderInput = (operator: FilterOperator, value: any, onChange: (value: any) => void) => {
    if (isMultiValue(operator)) {
      return (
        <Textarea
          placeholder="Enter values separated by commas"
          value={Array.isArray(value) ? value.join(', ') : value}
          onChange={(e) => {
            const values = e.target.value.split(',').map(v => v.trim()).filter(v => v)
            onChange(values)
          }}
          className="min-h-[80px]"
        />
      )
    }
    
    const needsMode = ['contains', 'startsWith', 'endsWith'].includes(operator)
    
    return (
      <div className="space-y-2">
        <Input
          type="text"
          placeholder={`Enter ${config.label.toLowerCase()}`}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
        {needsMode && (
          <Select value={mode} onValueChange={(val: any) => setMode(val)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Case sensitivity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="insensitive">Case insensitive</SelectItem>
              <SelectItem value="sensitive">Case sensitive</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
    )
  }
  
  const handleChange = (val: FilterValue | null) => {
    if (val && ['contains', 'startsWith', 'endsWith'].includes(val.operator)) {
      onChange({ ...val, mode })
    } else {
      onChange(val)
    }
  }
  
  return (
    <BaseFilter
      config={config}
      value={value}
      onChange={handleChange}
      renderInput={renderInput}
    />
  )
}