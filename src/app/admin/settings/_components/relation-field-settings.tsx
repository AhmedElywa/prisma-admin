'use client'

import { AdminField } from '@/lib/admin/types'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X, Plus } from 'lucide-react'
import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RELATION_DEFAULTS, RELATION_PRESETS, getRelationType } from '@/lib/admin/relation-defaults'

interface RelationFieldSettingsProps {
  field: AdminField
  onUpdateField: (updates: Partial<AdminField>) => void
}

export function RelationFieldSettings({ field, onUpdateField }: RelationFieldSettingsProps) {
  const [previewField, setPreviewField] = useState('')
  const relationType = getRelationType(field)
  
  if (!relationType) return null
  
  const defaults = RELATION_DEFAULTS[relationType]
  
  // Handle preset application
  const applyPreset = (preset: keyof typeof RELATION_PRESETS) => {
    const presetConfig = RELATION_PRESETS[preset][relationType]
    if (presetConfig) {
      const updates: Partial<AdminField> = {
        relationDisplayMode: presetConfig.relationDisplayMode,
        relationEditMode: presetConfig.relationEditMode,
      }
      
      if ('relationLoadStrategy' in presetConfig) {
        updates.relationLoadStrategy = presetConfig.relationLoadStrategy
      }
      
      if ('relationEditOptions' in presetConfig) {
        updates.relationEditOptions = {
          ...field.relationEditOptions,
          ...presetConfig.relationEditOptions
        }
      }
      
      onUpdateField(updates)
    }
  }
  
  // Handle preview fields
  const addPreviewField = () => {
    if (!previewField) return
    
    const currentFields = field.relationEditOptions?.previewFields || defaults.relationEditOptions?.previewFields || []
    if (!currentFields.includes(previewField)) {
      onUpdateField({
        relationEditOptions: {
          ...field.relationEditOptions,
          previewFields: [...currentFields, previewField]
        }
      })
    }
    setPreviewField('')
  }
  
  const removePreviewField = (fieldToRemove: string) => {
    const currentFields = field.relationEditOptions?.previewFields || []
    onUpdateField({
      relationEditOptions: {
        ...field.relationEditOptions,
        previewFields: currentFields.filter(f => f !== fieldToRemove)
      }
    })
  }
  
  return (
    <div className="space-y-4">
      {/* Relation Type Badge */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Relation Type:</span>
        <Badge variant="secondary">{relationType}</Badge>
        <span className="text-sm text-muted-foreground">→ {field.type}</span>
      </div>
      
      <Tabs defaultValue="display" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="display">Display</TabsTrigger>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        <TabsContent value="display" className="space-y-4">
          {/* Display Mode */}
          <div className="space-y-2">
            <Label>Display Mode</Label>
            <Select
              value={field.relationDisplayMode || defaults.relationDisplayMode}
              onValueChange={(value) => onUpdateField({ relationDisplayMode: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dropdown">Dropdown (with actions)</SelectItem>
                <SelectItem value="tags">Tags (pills)</SelectItem>
                <SelectItem value="count">Count (with preview)</SelectItem>
                <SelectItem value="inline">Inline (full display)</SelectItem>
                <SelectItem value="badge">Badge (compact)</SelectItem>
                <SelectItem value="link">Link (simple)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Actions */}
          <div className="space-y-2">
            <Label>Available Actions</Label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <Checkbox
                  checked={field.relationActions?.filter !== false}
                  onCheckedChange={(checked) => onUpdateField({
                    relationActions: { ...field.relationActions, filter: !!checked }
                  })}
                />
                <span className="text-sm">Allow Filter</span>
              </label>
              <label className="flex items-center space-x-2">
                <Checkbox
                  checked={field.relationActions?.view !== false}
                  onCheckedChange={(checked) => onUpdateField({
                    relationActions: { ...field.relationActions, view: !!checked }
                  })}
                />
                <span className="text-sm">Allow View</span>
              </label>
              <label className="flex items-center space-x-2">
                <Checkbox
                  checked={field.relationActions?.edit !== false}
                  onCheckedChange={(checked) => onUpdateField({
                    relationActions: { ...field.relationActions, edit: !!checked }
                  })}
                />
                <span className="text-sm">Allow Edit</span>
              </label>
              <label className="flex items-center space-x-2">
                <Checkbox
                  checked={field.relationActions?.viewAll !== false}
                  onCheckedChange={(checked) => onUpdateField({
                    relationActions: { ...field.relationActions, viewAll: !!checked }
                  })}
                />
                <span className="text-sm">Allow View All</span>
              </label>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="edit" className="space-y-4">
          {/* Edit Mode */}
          <div className="space-y-2">
            <Label>Edit Mode</Label>
            <Select
              value={field.relationEditMode || defaults.relationEditMode}
              onValueChange={(value) => onUpdateField({ relationEditMode: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="select">Select (dropdown)</SelectItem>
                <SelectItem value="autocomplete">Autocomplete (search)</SelectItem>
                <SelectItem value="tags">Tags (multi-select)</SelectItem>
                <SelectItem value="duallist">Dual List</SelectItem>
                <SelectItem value="modal">Modal (table view)</SelectItem>
                <SelectItem value="inline">Inline (embedded form)</SelectItem>
                <SelectItem value="checkbox">Checkbox List</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Edit Options */}
          <div className="space-y-2">
            <Label>Edit Options</Label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <Checkbox
                  checked={field.relationEditOptions?.searchable !== false}
                  onCheckedChange={(checked) => onUpdateField({
                    relationEditOptions: { ...field.relationEditOptions, searchable: !!checked }
                  })}
                />
                <span className="text-sm">Searchable</span>
              </label>
              <label className="flex items-center space-x-2">
                <Checkbox
                  checked={field.relationEditOptions?.createable === true}
                  onCheckedChange={(checked) => onUpdateField({
                    relationEditOptions: { ...field.relationEditOptions, createable: !!checked }
                  })}
                />
                <span className="text-sm">Allow Create New</span>
              </label>
            </div>
          </div>
          
          {/* Max Display */}
          <div className="space-y-2">
            <Label>Max Display Items</Label>
            <Input
              type="number"
              min="1"
              max="100"
              value={field.relationEditOptions?.maxDisplay || defaults.relationEditOptions?.maxDisplay || 5}
              onChange={(e) => onUpdateField({
                relationEditOptions: { 
                  ...field.relationEditOptions, 
                  maxDisplay: parseInt(e.target.value) || 5 
                }
              })}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-4">
          {/* Preview Fields */}
          <div className="space-y-2">
            <Label>Preview Fields</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Add field name..."
                  value={previewField}
                  onChange={(e) => setPreviewField(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addPreviewField()
                    }
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={addPreviewField}
                  disabled={!previewField}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(field.relationEditOptions?.previewFields || defaults.relationEditOptions?.previewFields || []).map(fieldName => (
                  <Badge key={fieldName} variant="secondary">
                    {fieldName}
                    <button
                      type="button"
                      className="ml-1 hover:text-destructive"
                      onClick={() => removePreviewField(fieldName)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          {/* Load Strategy */}
          <div className="space-y-2">
            <Label>Load Strategy</Label>
            <Select
              value={field.relationLoadStrategy || defaults.relationLoadStrategy}
              onValueChange={(value) => onUpdateField({ relationLoadStrategy: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eager">Eager (load with parent)</SelectItem>
                <SelectItem value="lazy">Lazy (load on first access)</SelectItem>
                <SelectItem value="ondemand">On Demand (load on user action)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Presets */}
          <div className="space-y-2">
            <Label>Apply Preset</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyPreset('compact')}
              >
                Compact
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyPreset('rich')}
              >
                Rich
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyPreset('performance')}
              >
                Performance
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}