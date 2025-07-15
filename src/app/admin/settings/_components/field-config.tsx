'use client';

import { ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { AdminField, AdminModel } from '@/lib/admin/types';
import { RelationFieldSettings } from './relation-field-settings';

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
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());
  const [draggedField, setDraggedField] = useState<string | null>(null);
  const [dragOverField, setDragOverField] = useState<string | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<
    'top' | 'bottom' | null
  >(null);

  const toggleFieldExpanded = (fieldId: string) => {
    const newExpanded = new Set(expandedFields);
    if (newExpanded.has(fieldId)) {
      newExpanded.delete(fieldId);
    } else {
      newExpanded.add(fieldId);
    }
    setExpandedFields(newExpanded);
  };

  const handleDragStart = (e: React.DragEvent, fieldId: string) => {
    setDraggedField(fieldId);
    e.dataTransfer.effectAllowed = 'move';
    // Add dragging class to body to change cursor globally
    document.body.classList.add('dragging');
  };

  const handleDragOver = (e: React.DragEvent, fieldId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (draggedField === fieldId) {
      return;
    }

    // Calculate if we're in the top or bottom half of the row
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    const position = y < rect.height / 2 ? 'top' : 'bottom';

    setDragOverField(fieldId);
    setDragOverPosition(position);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're leaving the table entirely
    if (!(e.relatedTarget && (e.relatedTarget as HTMLElement).closest('tr'))) {
      setDragOverField(null);
      setDragOverPosition(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetFieldId: string) => {
    e.preventDefault();

    if (!draggedField || draggedField === targetFieldId) {
      setDraggedField(null);
      setDragOverField(null);
      setDragOverPosition(null);
      return;
    }

    const fields = [...model.fields];
    const draggedIndex = fields.findIndex((f) => f.id === draggedField);
    const targetIndex = fields.findIndex((f) => f.id === targetFieldId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedField(null);
      setDragOverField(null);
      setDragOverPosition(null);
      return;
    }

    // Remove dragged field
    const [draggedFieldObj] = fields.splice(draggedIndex, 1);

    // Calculate new position based on drag position
    let newIndex = targetIndex;
    if (dragOverPosition === 'bottom') {
      newIndex = draggedIndex < targetIndex ? targetIndex : targetIndex + 1;
    } else {
      newIndex = draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;
    }

    // Insert at new position
    fields.splice(newIndex, 0, draggedFieldObj);

    // Update order property for all fields
    const reorderedFields = fields.map((field, idx) => ({
      ...field,
      order: idx,
    }));

    onReorderFields(reorderedFields);
    setDraggedField(null);
    setDragOverField(null);
    setDragOverPosition(null);
  };

  const handleDragEnd = () => {
    setDraggedField(null);
    setDragOverField(null);
    setDragOverPosition(null);
    // Remove dragging class from body
    document.body.classList.remove('dragging');
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]" />
            <TableHead className="min-w-[150px]">Field</TableHead>
            <TableHead className="min-w-[150px]">Display Name</TableHead>
            <TableHead className="w-[70px] text-center">Read</TableHead>
            <TableHead className="w-[70px] text-center">Create</TableHead>
            <TableHead className="w-[70px] text-center">Update</TableHead>
            <TableHead className="w-[70px] text-center">Filter</TableHead>
            <TableHead className="w-[70px] text-center">Sort</TableHead>
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {model.fields.map((field, index) => (
            <React.Fragment key={`field-${field.id}-${index}`}>
              <TableRow
                className={`relative transition-all ${draggedField === field.id ? 'opacity-20' : ''} 
                  ${expandedFields.has(field.id) ? 'border-b-0' : ''} ${draggedField && draggedField !== field.id ? 'cursor-move' : ''} `}
                draggable
                onDragEnd={handleDragEnd}
                onDragLeave={handleDragLeave}
                onDragOver={(e) => handleDragOver(e, field.id)}
                onDragStart={(e) => handleDragStart(e, field.id)}
                onDrop={(e) => handleDrop(e, field.id)}
                style={{
                  borderTop:
                    dragOverField === field.id && dragOverPosition === 'top'
                      ? '2px solid hsl(var(--primary))'
                      : undefined,
                  borderBottom:
                    dragOverField === field.id && dragOverPosition === 'bottom'
                      ? '2px solid hsl(var(--primary))'
                      : undefined,
                }}
              >
                <TableCell className="py-2">
                  <Button
                    className="h-8 w-8 cursor-move hover:bg-muted"
                    onMouseDown={(e) =>
                      (e.currentTarget.style.cursor = 'grabbing')
                    }
                    onMouseUp={(e) => (e.currentTarget.style.cursor = 'move')}
                    size="icon"
                    variant="ghost"
                  >
                    <GripVertical className="h-4 w-4" />
                  </Button>
                </TableCell>
                <TableCell className="py-2 font-medium">
                  <div>
                    <div className="flex items-center gap-1">
                      {field.name}
                      {field.required && (
                        <span className="text-red-500">*</span>
                      )}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {field.type}
                      {field.list && '[]'}
                      {field.relationField ? (
                        <>
                          {' • '}
                          {field.list ? 'one-to-many' : 'many-to-one'} →{' '}
                          {field.type}
                        </>
                      ) : (
                        <>
                          {' • '}
                          {field.kind} field
                          {field.unique && ', unique'}
                          {field.isId && ', primary key'}
                        </>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-2">
                  <Input
                    className="h-8 w-full"
                    onChange={(e) =>
                      onUpdateField(field.id, { title: e.target.value })
                    }
                    value={field.title}
                  />
                </TableCell>
                <TableCell className="py-2 text-center">
                  <Checkbox
                    checked={field.read}
                    onCheckedChange={(checked) =>
                      onUpdateField(field.id, { read: !!checked })
                    }
                  />
                </TableCell>
                <TableCell className="py-2 text-center">
                  <Checkbox
                    checked={field.create}
                    disabled={field.isId || field.relationField}
                    onCheckedChange={(checked) =>
                      onUpdateField(field.id, { create: !!checked })
                    }
                  />
                </TableCell>
                <TableCell className="py-2 text-center">
                  <Checkbox
                    checked={field.update}
                    disabled={field.isId || field.relationField}
                    onCheckedChange={(checked) =>
                      onUpdateField(field.id, { update: !!checked })
                    }
                  />
                </TableCell>
                <TableCell className="py-2 text-center">
                  <Checkbox
                    checked={field.filter}
                    onCheckedChange={(checked) =>
                      onUpdateField(field.id, { filter: !!checked })
                    }
                  />
                </TableCell>
                <TableCell className="py-2 text-center">
                  <Checkbox
                    checked={field.sort}
                    disabled={field.list || field.relationField}
                    onCheckedChange={(checked) =>
                      onUpdateField(field.id, { sort: !!checked })
                    }
                  />
                </TableCell>
                <TableCell className="py-2">
                  <Button
                    className="h-8 w-8"
                    onClick={() => toggleFieldExpanded(field.id)}
                    size="icon"
                    variant="ghost"
                  >
                    {expandedFields.has(field.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </TableCell>
              </TableRow>
              {expandedFields.has(field.id) && (
                <TableRow className="bg-muted/50">
                  <TableCell className="p-0" colSpan={1}>
                    {/* Empty cells for alignment */}
                  </TableCell>
                  <TableCell className="p-0" colSpan={7}>
                    <div className="space-y-3 border-t px-2 py-4">
                      {field.relationField ? (
                        <RelationFieldSettings
                          field={field}
                          onUpdateField={(updates) =>
                            onUpdateField(field.id, updates)
                          }
                        />
                      ) : field.type === 'String' ? (
                        <div className="space-y-2">
                          <p className="mb-3 font-medium text-sm">
                            Field Input Type
                          </p>
                          <div className="space-y-2">
                            <label className="flex cursor-pointer items-center space-x-2">
                              <input
                                checked={!(field.editor || field.upload)}
                                className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                                name={`field-type-${field.id}`}
                                onChange={() =>
                                  onUpdateField(field.id, {
                                    editor: false,
                                    upload: false,
                                  })
                                }
                                type="radio"
                              />
                              <span className="text-sm">
                                Standard Text Input
                              </span>
                            </label>
                            <label className="flex cursor-pointer items-center space-x-2">
                              <input
                                checked={field.editor === true}
                                className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                                name={`field-type-${field.id}`}
                                onChange={() =>
                                  onUpdateField(field.id, {
                                    editor: true,
                                    upload: false,
                                  })
                                }
                                type="radio"
                              />
                              <span className="text-sm">Rich Text Editor</span>
                            </label>
                            <label className="flex cursor-pointer items-center space-x-2">
                              <input
                                checked={field.upload === true}
                                className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                                name={`field-type-${field.id}`}
                                onChange={() =>
                                  onUpdateField(field.id, {
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
                          No additional options available for {field.type}{' '}
                          fields.
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
