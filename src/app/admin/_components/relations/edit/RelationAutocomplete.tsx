'use client'

import { useState, useEffect, useCallback } from 'react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { ChevronsUpDown, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AdminField } from '@/lib/admin/types'
import { Label } from '@/components/ui/label'
import { debounce } from 'lodash'

interface RelationAutocompleteProps {
  name: string
  label: string
  value?: any
  required?: boolean
  disabled?: boolean
  placeholder?: string
  relatedModel: string
  field: AdminField
}

export function RelationAutocomplete({
  name,
  label,
  value,
  required,
  disabled,
  placeholder,
  relatedModel,
  field,
}: RelationAutocompleteProps) {
  const [open, setOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState<string>(value?.id?.toString() || '')
  const [selectedDisplay, setSelectedDisplay] = useState<string>('')
  const [options, setOptions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  
  // Get display fields from relation options
  const displayFields = field.relationEditOptions?.previewFields || ['id', 'name', 'title']
  const pageSize = field.relationEditOptions?.pageSize || 20
  const minChars = 2 // Minimum characters before searching
  
  // Load initial value display
  useEffect(() => {
    if (value && typeof value === 'object') {
      const display = getDisplayValue(value)
      setSelectedDisplay(display)
      setSelectedValue(value.id?.toString() || '')
    } else if (value) {
      // Value is just an ID, load the full record
      loadSingleRecord(value)
    }
  }, [value])
  
  async function loadSingleRecord(id: string | number) {
    try {
      const response = await fetch(`/api/admin/data?model=${relatedModel}&id=${id}`)
      if (response.ok) {
        const record = await response.json()
        const display = getDisplayValue(record)
        setSelectedDisplay(display)
      }
    } catch (error) {
      console.error('Failed to load record:', error)
    }
  }
  
  const loadOptions = useCallback(
    debounce(async (searchTerm: string) => {
      if (searchTerm.length < minChars) {
        setOptions([])
        return
      }
      
      setLoading(true)
      try {
        const params = new URLSearchParams({
          model: relatedModel,
          page: '1',
          perPage: pageSize.toString(),
          search: searchTerm,
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
    }, 300),
    [relatedModel, pageSize]
  )
  
  useEffect(() => {
    if (open && search) {
      loadOptions(search)
    }
  }, [search, open, loadOptions])
  
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
  
  function handleSelect(option: any) {
    const optionId = option.id?.toString() || ''
    setSelectedValue(optionId)
    setSelectedDisplay(getDisplayValue(option))
    setOpen(false)
    setSearch('')
  }
  
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            {selectedDisplay || placeholder || `Search ${label}...`}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder={`Type at least ${minChars} characters to search...`}
              value={search}
              onValueChange={setSearch}
            />
            {search.length < minChars ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Type at least {minChars} characters to search
              </div>
            ) : loading ? (
              <div className="py-6 text-center">
                <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                <p className="mt-2 text-sm text-muted-foreground">Searching...</p>
              </div>
            ) : options.length === 0 ? (
              <CommandEmpty>No results found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {!required && (
                  <CommandItem
                    onSelect={() => {
                      setSelectedValue('')
                      setSelectedDisplay('')
                      setOpen(false)
                      setSearch('')
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedValue === '' ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="text-muted-foreground">None</span>
                  </CommandItem>
                )}
                {options.map((option) => {
                  const optionId = option.id?.toString() || ''
                  const display = getDisplayValue(option)
                  
                  return (
                    <CommandItem
                      key={optionId}
                      value={display}
                      onSelect={() => handleSelect(option)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedValue === optionId ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {display}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            )}
          </Command>
        </PopoverContent>
      </Popover>
      
      {/* Hidden input for form submission */}
      <input
        type="hidden"
        name={name}
        value={selectedValue}
        required={required}
      />
    </div>
  )
}