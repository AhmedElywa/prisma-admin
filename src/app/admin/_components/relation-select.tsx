'use client'

import { useState, useEffect, useCallback } from 'react'
import { Check, ChevronsUpDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import { getModelData } from '@/lib/actions/crud'
import { getModelSettingsAction } from '@/lib/actions/settings-actions'
import debounce from 'lodash/debounce'

interface RelationSelectProps {
  name: string
  label: string
  relatedModel: string
  value?: any
  required?: boolean
  disabled?: boolean
  placeholder?: string
}

export function RelationSelect({
  name,
  label,
  relatedModel,
  value,
  required = false,
  disabled = false,
  placeholder = 'Select...',
}: RelationSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedValue, setSelectedValue] = useState<any>(value)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [displayFields, setDisplayFields] = useState<string[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(1)

  // Load display fields configuration
  useEffect(() => {
    async function loadDisplayFields() {
      const modelSettings = await getModelSettingsAction(relatedModel)
      if (modelSettings) {
        setDisplayFields(modelSettings.displayFields)
      }
    }
    loadDisplayFields()
  }, [relatedModel])

  // Debounced search function
  const debouncedLoadItems = useCallback(
    debounce(async (searchTerm: string, pageNum: number = 1) => {
      setLoading(true)
      try {
        const result = await getModelData(relatedModel, {
          page: pageNum,
          perPage: 50,
          search: searchTerm,
        })
        
        if (pageNum === 1) {
          setItems(result.data)
        } else {
          setItems(prev => [...prev, ...result.data])
        }
        
        setHasMore(result.page < result.totalPages)
      } catch (error) {
        console.error('Failed to load items:', error)
      } finally {
        setLoading(false)
      }
    }, 300),
    [relatedModel]
  )

  // Load items when search changes
  useEffect(() => {
    if (open) {
      setPage(1)
      debouncedLoadItems(search, 1)
    }
  }, [search, open, debouncedLoadItems])

  // Load initial value details if needed
  useEffect(() => {
    async function loadInitialValue() {
      if (value && (!selectedValue || selectedValue.id !== value)) {
        try {
          const result = await getModelData(relatedModel, {
            page: 1,
            perPage: 1,
            filters: [{ field: 'id', operator: 'equals', value }]
          })
          if (result.data.length > 0) {
            setSelectedValue(result.data[0])
          }
        } catch (error) {
          console.error('Failed to load initial value:', error)
        }
      }
    }
    loadInitialValue()
  }, [value, relatedModel])

  // Get display text for an item
  const getItemDisplay = (item: any) => {
    if (!item) return ''
    return formatDisplayValue(item)
  }

  // Format display value synchronously for rendering
  const formatDisplayValue = (item: any) => {
    if (!item) return ''
    
    // Try to use display fields
    if (displayFields.length > 0) {
      const values = displayFields
        .map(field => item[field])
        .filter(val => val !== null && val !== undefined)
        .map(String)
      
      if (values.length > 0) {
        return values.join(' - ')
      }
    }
    
    // Fallback to common fields
    return item.name || item.title || item.email || item.username || `ID: ${item.id}`
  }

  // Handle item selection
  const handleSelect = (item: any) => {
    setSelectedValue(item)
    setOpen(false)
  }

  // Load more items when scrolling to bottom
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      debouncedLoadItems(search, nextPage)
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <input
        type="hidden"
        name={name}
        value={selectedValue?.id || ''}
      />
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            <span className="truncate">
              {selectedValue ? formatDisplayValue(selectedValue) : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <input
                className="flex h-11 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                placeholder={`Search ${label.toLowerCase()}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <CommandList>
              {loading && items.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Loading...
                </div>
              ) : items.length === 0 ? (
                <CommandEmpty>No results found.</CommandEmpty>
              ) : (
                <CommandGroup>
                  {items.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={item.id}
                      onSelect={() => handleSelect(item)}
                      className="flex items-center justify-between"
                    >
                      <div className="flex flex-col">
                        <span>{formatDisplayValue(item)}</span>
                        {item.id && (
                          <span className="text-xs text-muted-foreground">
                            ID: {item.id}
                          </span>
                        )}
                      </div>
                      <Check
                        className={cn(
                          'ml-auto h-4 w-4',
                          selectedValue?.id === item.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                    </CommandItem>
                  ))}
                  {hasMore && (
                    <CommandItem
                      onSelect={handleLoadMore}
                      className="justify-center text-sm text-muted-foreground cursor-pointer"
                    >
                      {loading ? 'Loading more...' : 'Load more'}
                    </CommandItem>
                  )}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {!required && selectedValue && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setSelectedValue(null)}
          disabled={disabled}
          className="mt-1"
        >
          Clear selection
        </Button>
      )}
    </div>
  )
}