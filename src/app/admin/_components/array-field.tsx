'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus, X, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface ArrayFieldProps {
  name: string
  label: string
  type: 'String' | 'Int' | 'Float' | 'Boolean' | 'DateTime' | 'Json'
  value?: any[]
  onChange?: (value: any[]) => void
  required?: boolean
  placeholder?: string
}

interface SortableItemProps {
  id: string
  index: number
  value: any
  type: ArrayFieldProps['type']
  onUpdate: (index: number, value: any) => void
  onRemove: (index: number) => void
}

function SortableItem({ id, index, value, type, onUpdate, onRemove }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const renderInput = () => {
    switch (type) {
      case 'Boolean':
        return (
          <Select
            value={value?.toString() || 'false'}
            onValueChange={(v) => onUpdate(index, v === 'true')}
          >
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
        )
      case 'Int':
      case 'Float':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => onUpdate(index, type === 'Int' ? parseInt(e.target.value) : parseFloat(e.target.value))}
            className="flex-1"
            step={type === 'Float' ? '0.01' : '1'}
          />
        )
      case 'DateTime':
        return (
          <Input
            type="datetime-local"
            value={value ? new Date(value).toISOString().slice(0, 16) : ''}
            onChange={(e) => onUpdate(index, e.target.value ? new Date(e.target.value).toISOString() : null)}
            className="flex-1"
          />
        )
      case 'Json':
        return (
          <Textarea
            value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value)
                onUpdate(index, parsed)
              } catch {
                onUpdate(index, e.target.value)
              }
            }}
            className="flex-1 font-mono text-sm"
            rows={3}
          />
        )
      default:
        return (
          <Input
            type="text"
            value={value || ''}
            onChange={(e) => onUpdate(index, e.target.value)}
            className="flex-1"
          />
        )
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-start gap-2 p-2 bg-background rounded-md border",
        isDragging && "opacity-50"
      )}
    >
      <button
        className="mt-2 cursor-move touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>
      
      {renderInput()}
      
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onRemove(index)}
        className="h-8 w-8 p-0 mt-1"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function ArrayField({
  name,
  label,
  type,
  value = [],
  onChange,
  required = false,
  placeholder = 'Add item...'
}: ArrayFieldProps) {
  const [items, setItems] = useState<Array<{ id: string; value: any }>>(
    value.map((v, i) => ({ id: `item-${i}`, value: v }))
  )
  const [newValue, setNewValue] = useState<any>('')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    onChange?.(items.map(item => item.value))
  }, [items])

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id)
        const newIndex = items.findIndex(item => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const addItem = () => {
    let valueToAdd = newValue
    
    // Convert value based on type
    switch (type) {
      case 'Int':
        valueToAdd = parseInt(newValue) || 0
        break
      case 'Float':
        valueToAdd = parseFloat(newValue) || 0
        break
      case 'Boolean':
        valueToAdd = newValue === 'true'
        break
      case 'Json':
        try {
          valueToAdd = JSON.parse(newValue)
        } catch {
          valueToAdd = newValue
        }
        break
    }

    if (valueToAdd !== '' && valueToAdd !== null) {
      setItems([...items, { id: `item-${Date.now()}`, value: valueToAdd }])
      setNewValue('')
    }
  }

  const updateItem = (index: number, value: any) => {
    const newItems = [...items]
    newItems[index].value = value
    setItems(newItems)
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const renderNewInput = () => {
    switch (type) {
      case 'Boolean':
        return (
          <Select
            value={newValue.toString() || 'false'}
            onValueChange={setNewValue}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select value" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
        )
      case 'Int':
      case 'Float':
        return (
          <Input
            type="number"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder={placeholder}
            className="flex-1"
            step={type === 'Float' ? '0.01' : '1'}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem())}
          />
        )
      case 'DateTime':
        return (
          <Input
            type="datetime-local"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="flex-1"
          />
        )
      case 'Json':
        return (
          <Textarea
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder='{"key": "value"}'
            className="flex-1 font-mono text-sm"
            rows={2}
          />
        )
      default:
        return (
          <Input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder={placeholder}
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem())}
          />
        )
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      {items.length > 0 && (
        <div className="space-y-2">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map(item => item.id)}
              strategy={verticalListSortingStrategy}
            >
              {items.map((item, index) => (
                <SortableItem
                  key={item.id}
                  id={item.id}
                  index={index}
                  value={item.value}
                  type={type}
                  onUpdate={updateItem}
                  onRemove={removeItem}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
      
      <div className="flex gap-2">
        {renderNewInput()}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addItem}
          disabled={!newValue && type !== 'Boolean'}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Hidden inputs for form submission */}
      {items.map((item, index) => (
        <input
          key={item.id}
          type="hidden"
          name={`${name}[${index}]`}
          value={typeof item.value === 'object' ? JSON.stringify(item.value) : item.value}
        />
      ))}
      
      {items.length === 0 && (
        <input type="hidden" name={name} value="[]" />
      )}
    </div>
  )
}