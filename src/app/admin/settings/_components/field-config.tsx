'use client';

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { GripVertical } from 'lucide-react';
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AdminField, AdminModel } from '@/lib/admin/types';
import { RelationFieldSettings } from './relation-field-settings';
import { SortableFieldItem } from './sortable-field-item';

interface FieldConfigProps {
  model: AdminModel;
  onUpdateField: (fieldId: string, updates: Partial<AdminField>) => void;
  onReorderFields: (fields: AdminField[]) => void;
}

export function FieldConfig({
  model,
  onUpdateField,
  onReorderFields,
}: FieldConfigProps) {
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(
    model.fields[0]?.id || null
  );
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const selectedField = model.fields.find((f) => f.id === selectedFieldId);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = model.fields.findIndex((f) => f.id === active.id);
      const newIndex = model.fields.findIndex((f) => f.id === over.id);

      const reorderedFields = arrayMove(model.fields, oldIndex, newIndex).map(
        (field, idx) => ({
          ...field,
          order: idx,
        })
      );

      onReorderFields(reorderedFields);
    }

    setActiveId(null);
  };

  const activeField = activeId
    ? model.fields.find((f) => f.id === activeId)
    : null;

  return (
    <div className="flex h-[600px] divide-x">
      {/* Left Panel - Field List */}
      <div className="w-80 flex-shrink-0 overflow-y-auto">
        <DndContext
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
          sensors={sensors}
        >
          <SortableContext
            items={model.fields.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1 p-4">
              {model.fields.map((field) => (
                <SortableFieldItem
                  field={field}
                  isSelected={selectedFieldId === field.id}
                  key={field.id}
                  onClick={() => setSelectedFieldId(field.id)}
                />
              ))}
            </div>
          </SortableContext>
          <DragOverlay>
            {activeField ? (
              <div className="cursor-move rounded-md border bg-background p-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {activeField.name}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {activeField.type}
                      {activeField.list && '[]'}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Right Panel - Field Details */}
      <div className="flex-1 overflow-y-auto">
        {selectedField ? (
          <div className="space-y-6 p-6">
            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="display-name">Display Name</Label>
              <Input
                id="display-name"
                onChange={(e) =>
                  onUpdateField(selectedField.id, { title: e.target.value })
                }
                placeholder="Enter display name"
                value={selectedField.title}
              />
            </div>

            {/* Permissions */}
            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="flex flex-wrap gap-4 rounded-md border px-3 py-2">
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedField.read}
                    onCheckedChange={(checked) =>
                      onUpdateField(selectedField.id, { read: !!checked })
                    }
                  />
                  <span className="text-sm">Read</span>
                </label>
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedField.create}
                    disabled={selectedField.isId || selectedField.relationField}
                    onCheckedChange={(checked) =>
                      onUpdateField(selectedField.id, { create: !!checked })
                    }
                  />
                  <span className="text-sm">Create</span>
                </label>
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedField.update}
                    disabled={selectedField.isId || selectedField.relationField}
                    onCheckedChange={(checked) =>
                      onUpdateField(selectedField.id, { update: !!checked })
                    }
                  />
                  <span className="text-sm">Update</span>
                </label>
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedField.filter}
                    onCheckedChange={(checked) =>
                      onUpdateField(selectedField.id, { filter: !!checked })
                    }
                  />
                  <span className="text-sm">Filter</span>
                </label>
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedField.sort}
                    disabled={selectedField.list || selectedField.relationField}
                    onCheckedChange={(checked) =>
                      onUpdateField(selectedField.id, { sort: !!checked })
                    }
                  />
                  <span className="text-sm">Sort</span>
                </label>
              </div>
            </div>

            {/* Field-specific Options */}
            {selectedField.relationField ? (
              <RelationFieldSettings
                field={selectedField}
                onUpdateField={(updates) =>
                  onUpdateField(selectedField.id, updates)
                }
              />
            ) : selectedField.type === 'String' ? (
              <div className="space-y-3">
                <h3 className="font-medium">Field Input Type</h3>
                <div className="space-y-2">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      checked={!(selectedField.editor || selectedField.upload)}
                      className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                      name={`field-type-${selectedField.id}`}
                      onChange={() =>
                        onUpdateField(selectedField.id, {
                          editor: false,
                          upload: false,
                        })
                      }
                      type="radio"
                    />
                    <span className="text-sm">Standard Text Input</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      checked={selectedField.editor === true}
                      className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                      name={`field-type-${selectedField.id}`}
                      onChange={() =>
                        onUpdateField(selectedField.id, {
                          editor: true,
                          upload: false,
                        })
                      }
                      type="radio"
                    />
                    <span className="text-sm">Rich Text Editor</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      checked={selectedField.upload === true}
                      className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                      name={`field-type-${selectedField.id}`}
                      onChange={() =>
                        onUpdateField(selectedField.id, {
                          upload: true,
                          editor: false,
                        })
                      }
                      type="radio"
                    />
                    <span className="text-sm">File Upload</span>
                  </label>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">
                No additional options available for {selectedField.type} fields.
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Select a field to view details
          </div>
        )}
      </div>
    </div>
  );
}
