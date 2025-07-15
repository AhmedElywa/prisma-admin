'use client';

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ArrayFieldProps {
  name: string;
  label: string;
  type: 'String' | 'Int' | 'Float' | 'Boolean' | 'DateTime' | 'Json';
  value?: any[];
  onChange?: (value: any[]) => void;
  required?: boolean;
  placeholder?: string;
}

interface SortableItemProps {
  id: string;
  index: number;
  value: any;
  type: ArrayFieldProps['type'];
  onUpdate: (index: number, value: any) => void;
  onRemove: (index: number) => void;
}

function SortableItem({
  id,
  index,
  value,
  type,
  onUpdate,
  onRemove,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const renderInput = () => {
    switch (type) {
      case 'Boolean':
        return (
          <Select
            onValueChange={(v) => onUpdate(index, v === 'true')}
            value={value?.toString() || 'false'}
          >
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
        );
      case 'Int':
      case 'Float':
        return (
          <Input
            className="flex-1"
            onChange={(e) =>
              onUpdate(
                index,
                type === 'Int'
                  ? Number.parseInt(e.target.value, 10)
                  : Number.parseFloat(e.target.value)
              )
            }
            step={type === 'Float' ? '0.01' : '1'}
            type="number"
            value={value || ''}
          />
        );
      case 'DateTime':
        return (
          <Input
            className="flex-1"
            onChange={(e) =>
              onUpdate(
                index,
                e.target.value ? new Date(e.target.value).toISOString() : null
              )
            }
            type="datetime-local"
            value={value ? new Date(value).toISOString().slice(0, 16) : ''}
          />
        );
      case 'Json':
        return (
          <Textarea
            className="flex-1 font-mono text-sm"
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                onUpdate(index, parsed);
              } catch {
                onUpdate(index, e.target.value);
              }
            }}
            rows={3}
            value={
              typeof value === 'string' ? value : JSON.stringify(value, null, 2)
            }
          />
        );
      default:
        return (
          <Input
            className="flex-1"
            onChange={(e) => onUpdate(index, e.target.value)}
            type="text"
            value={value || ''}
          />
        );
    }
  };

  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-md border bg-background p-2',
        isDragging && 'opacity-50'
      )}
      ref={setNodeRef}
      style={style}
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
        className="mt-1 h-8 w-8 p-0"
        onClick={() => onRemove(index)}
        size="sm"
        type="button"
        variant="ghost"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function ArrayField({
  name,
  label,
  type,
  value = [],
  onChange,
  required = false,
  placeholder = 'Add item...',
}: ArrayFieldProps) {
  const [items, setItems] = useState<Array<{ id: string; value: any }>>(
    value.map((v, i) => ({ id: `item-${i}`, value: v }))
  );
  const [newValue, setNewValue] = useState<any>('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    onChange?.(items.map((item) => item.value));
  }, [items, onChange]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addItem = () => {
    let valueToAdd = newValue;

    // Convert value based on type
    switch (type) {
      case 'Int':
        valueToAdd = Number.parseInt(newValue, 10) || 0;
        break;
      case 'Float':
        valueToAdd = Number.parseFloat(newValue) || 0;
        break;
      case 'Boolean':
        valueToAdd = newValue === 'true';
        break;
      case 'Json':
        try {
          valueToAdd = JSON.parse(newValue);
        } catch {
          valueToAdd = newValue;
        }
        break;
    }

    if (valueToAdd !== '' && valueToAdd !== null) {
      setItems([...items, { id: `item-${Date.now()}`, value: valueToAdd }]);
      setNewValue('');
    }
  };

  const updateItem = (index: number, value: any) => {
    const newItems = [...items];
    newItems[index].value = value;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const renderNewInput = () => {
    switch (type) {
      case 'Boolean':
        return (
          <Select
            onValueChange={setNewValue}
            value={newValue.toString() || 'false'}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select value" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
        );
      case 'Int':
      case 'Float':
        return (
          <Input
            className="flex-1"
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={(e) =>
              e.key === 'Enter' && (e.preventDefault(), addItem())
            }
            placeholder={placeholder}
            step={type === 'Float' ? '0.01' : '1'}
            type="number"
            value={newValue}
          />
        );
      case 'DateTime':
        return (
          <Input
            className="flex-1"
            onChange={(e) => setNewValue(e.target.value)}
            type="datetime-local"
            value={newValue}
          />
        );
      case 'Json':
        return (
          <Textarea
            className="flex-1 font-mono text-sm"
            onChange={(e) => setNewValue(e.target.value)}
            placeholder='{"key": "value"}'
            rows={2}
            value={newValue}
          />
        );
      default:
        return (
          <Input
            className="flex-1"
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={(e) =>
              e.key === 'Enter' && (e.preventDefault(), addItem())
            }
            placeholder={placeholder}
            type="text"
            value={newValue}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </Label>

      {items.length > 0 && (
        <div className="space-y-2">
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            sensors={sensors}
          >
            <SortableContext
              items={items.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              {items.map((item, index) => (
                <SortableItem
                  id={item.id}
                  index={index}
                  key={item.id}
                  onRemove={removeItem}
                  onUpdate={updateItem}
                  type={type}
                  value={item.value}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}

      <div className="flex gap-2">
        {renderNewInput()}
        <Button
          disabled={!newValue && type !== 'Boolean'}
          onClick={addItem}
          size="sm"
          type="button"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Hidden inputs for form submission */}
      {items.map((item, index) => (
        <input
          key={item.id}
          name={`${name}[${index}]`}
          type="hidden"
          value={
            typeof item.value === 'object'
              ? JSON.stringify(item.value)
              : item.value
          }
        />
      ))}

      {items.length === 0 && <input name={name} type="hidden" value="[]" />}
    </div>
  );
}
