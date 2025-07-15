'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Search, X } from 'lucide-react'
import { getModelData } from '@/lib/actions/crud'

interface RelationPickerProps {
  name: string
  label: string
  relatedModel: string
  value?: any
  required?: boolean
  disabled?: boolean
}

export function RelationPicker({
  name,
  label,
  relatedModel,
  value,
  required = false,
  disabled = false,
}: RelationPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedItem, setSelectedItem] = useState<any>(value)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    if (isOpen) {
      loadItems()
    }
  }, [isOpen, search])
  
  
  const loadItems = async () => {
    setLoading(true)
    try {
      const result = await getModelData(relatedModel, {
        page: 1,
        perPage: 20,
        search,
      })
      setItems(result.data)
    } catch (error) {
      console.error('Failed to load items:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const selectItem = (item: any) => {
    setSelectedItem(item)
    setIsOpen(false)
  }
  
  const clearSelection = () => {
    setSelectedItem(null)
  }
  
  const getItemDisplay = (item: any) => {
    if (!item) return 'None'
    // Try common display fields
    return item.name || item.title || item.email || item.id || 'Unknown'
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
        value={selectedItem?.id || ''}
      />
      
      <div className="flex gap-2">
        <div className="flex-1 p-2 border rounded-md bg-muted">
          {selectedItem ? (
            <span className="text-sm">
              {getItemDisplay(selectedItem)}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">None selected</span>
          )}
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" disabled={disabled}>
              Select
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Select {label}</DialogTitle>
              <DialogDescription>
                Choose a {relatedModel.toLowerCase()} to connect
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1"
                />
              </div>
              
              <div className="border rounded-md max-h-[400px] overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Loading...
                  </div>
                ) : items.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No items found
                  </div>
                ) : (
                  <div className="divide-y">
                    {items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => selectItem(item)}
                        className="w-full p-3 text-left hover:bg-accent transition-colors flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium">
                            {getItemDisplay(item)}
                          </div>
                          {item.id && (
                            <div className="text-sm text-muted-foreground">
                              ID: {item.id}
                            </div>
                          )}
                        </div>
                        {selectedItem?.id === item.id && (
                          <div className="text-primary">✓</div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {selectedItem && !required && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={clearSelection}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}