'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, X, Link, Unlink, Loader2 } from 'lucide-react'
import { getModelData } from '@/lib/actions/crud'
import { getModelSettingsData } from '@/lib/actions/form-data'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface RelationConnectProps {
  name: string
  label: string
  relatedModel: string
  value?: any[]
  modelId: string | number
  modelName: string
}

export function RelationConnect({
  name,
  label,
  relatedModel,
  value = [],
  modelId,
  modelName,
}: RelationConnectProps) {
  const [connected, setConnected] = useState<any[]>(value)
  const [available, setAvailable] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [modelSettings, setModelSettings] = useState<any>(null)
  
  useEffect(() => {
    loadModelSettings()
  }, [relatedModel])
  
  useEffect(() => {
    if (modelSettings) {
      loadAvailable()
    }
  }, [search, modelSettings])
  
  const loadModelSettings = async () => {
    try {
      const settings = await getModelSettingsData(relatedModel)
      setModelSettings(settings)
    } catch (error) {
      console.error('Failed to load model settings:', error)
    }
  }
  
  const loadAvailable = async () => {
    setLoading(true)
    try {
      const result = await getModelData(relatedModel, {
        page: 1,
        perPage: 50,
        search,
      })
      
      // Filter out already connected items
      const connectedIds = connected.map((item: any) => item.id)
      const filtered = result.data.filter((item: any) => !connectedIds.includes(item.id))
      setAvailable(filtered)
    } catch (error) {
      console.error('Failed to load items:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const connect = (item: any) => {
    setConnected([...connected, item])
    setAvailable(available.filter((a: any) => a.id !== item.id))
  }
  
  const disconnect = (item: any) => {
    setConnected(connected.filter((c: any) => c.id !== item.id))
    setAvailable([...available, item].sort((a, b) => {
      const aDisplay = getItemDisplay(a).toLowerCase()
      const bDisplay = getItemDisplay(b).toLowerCase()
      return aDisplay.localeCompare(bDisplay)
    }))
  }
  
  const getItemDisplay = (item: any) => {
    if (!modelSettings) {
      return item.name || item.title || item.email || item.id || 'Unknown'
    }
    
    // Use display fields from settings
    const displayFields = modelSettings.displayFields || ['id']
    const displayValues = displayFields.map((field: string) => {
      const value = item[field]
      if (value === null || value === undefined) return ''
      if (typeof value === 'object') return JSON.stringify(value)
      return value
    }).filter(Boolean)
    
    return displayValues.join(' - ') || item.id
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        <CardDescription>
          Connect and disconnect {relatedModel.toLowerCase()} records
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hidden inputs for form submission */}
        {connected.map((item, index) => (
          <input
            key={`${name}-${index}`}
            type="hidden"
            name={`${name}[${index}]`}
            value={item.id}
          />
        ))}
        
        {/* Connected items */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Connected ({connected.length})</Label>
            {connected.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAvailable([...available, ...connected].sort((a, b) => {
                    const aDisplay = getItemDisplay(a).toLowerCase()
                    const bDisplay = getItemDisplay(b).toLowerCase()
                    return aDisplay.localeCompare(bDisplay)
                  }))
                  setConnected([])
                }}
                className="text-xs"
              >
                Disconnect All
              </Button>
            )}
          </div>
          <div className="border rounded-md p-3 min-h-[100px] bg-muted/30">
            {connected.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No connected items
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {connected.map(item => (
                  <Badge 
                    key={item.id} 
                    variant="secondary" 
                    className="gap-1 pr-1 hover:bg-secondary/80"
                  >
                    <span className="max-w-[200px] truncate">
                      {getItemDisplay(item)}
                    </span>
                    <button
                      type="button"
                      onClick={() => disconnect(item)}
                      className="ml-1 hover:bg-destructive/20 rounded p-0.5 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Search and available items */}
        <div>
          <Label className="mb-2">Available</Label>
          <div className="flex items-center gap-2 mb-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${relatedModel.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
          </div>
          
          <ScrollArea className="h-[200px] border rounded-md">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : available.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center text-muted-foreground p-4">
                {search ? (
                  <p className="text-sm">No matching items found</p>
                ) : (
                  <p className="text-sm">All items are already connected</p>
                )}
              </div>
            ) : (
              <div className="divide-y">
                {available.map(item => (
                  <div
                    key={item.id}
                    className={cn(
                      "p-3 flex items-center justify-between hover:bg-accent transition-colors",
                      "group cursor-pointer"
                    )}
                    onClick={() => connect(item)}
                  >
                    <span className="text-sm truncate max-w-[300px]">
                      {getItemDisplay(item)}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Link className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          
          {!loading && available.length > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              Click on an item to connect it
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}