'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { BaseFilter } from './base-filter'
import { FilterConfig, FilterOperator, FilterValue, isMultiValue } from './types'

interface EnumFilterProps {
  config: FilterConfig
  value?: FilterValue
  onChange: (value: FilterValue | null) => void
}

export function EnumFilter({ config, value, onChange }: EnumFilterProps) {
  const renderInput = (operator: FilterOperator, value: any, onChange: (value: any) => void) => {
    if (!config.enumValues || config.enumValues.length === 0) {
      return <div className="text-sm text-muted-foreground">No enum values available</div>
    }
    
    if (isMultiValue(operator)) {
      const selectedValues = Array.isArray(value) ? value : []
      
      return (
        <div className="space-y-2 max-h-[200px] overflow-y-auto border rounded-md p-3">
          {config.enumValues.map((enumValue) => (
            <div key={enumValue} className="flex items-center space-x-2">
              <Checkbox
                id={enumValue}
                checked={selectedValues.includes(enumValue)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onChange([...selectedValues, enumValue])
                  } else {
                    onChange(selectedValues.filter(v => v !== enumValue))
                  }
                }}
              />
              <Label htmlFor={enumValue} className="text-sm cursor-pointer">
                {enumValue}
              </Label>
            </div>
          ))}
        </div>
      )
    }
    
    return (
      <Select value={value || ''} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select value" />
        </SelectTrigger>
        <SelectContent>
          {config.enumValues.map((enumValue) => (
            <SelectItem key={enumValue} value={enumValue}>
              {enumValue}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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