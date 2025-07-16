'use client';

import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getRelationType,
  RELATION_DEFAULTS,
  RELATION_PRESETS,
} from '@/lib/admin/relation-defaults';
import {
  getActionHelpText,
  getDisplayModeHelpText,
  getValidActions,
  getValidDisplayModes,
} from '@/lib/admin/relation-validation';
import type { AdminField } from '@/lib/admin/types';

interface RelationFieldSettingsProps {
  field: AdminField;
  onUpdateField: (updates: Partial<AdminField>) => void;
}

export function RelationFieldSettings({
  field,
  onUpdateField,
}: RelationFieldSettingsProps) {
  const [previewField, setPreviewField] = useState('');
  const relationType = getRelationType(field);

  if (!relationType) {
    return null;
  }

  const defaults = RELATION_DEFAULTS[relationType];

  // Handle preset application
  const applyPreset = (preset: keyof typeof RELATION_PRESETS) => {
    const presetConfig = RELATION_PRESETS[preset][relationType];
    if (presetConfig) {
      const updates: Partial<AdminField> = {};

      // Only apply valid display mode
      if (presetConfig.relationDisplayMode) {
        const validModes = getValidDisplayModes(relationType);
        if (validModes.includes(presetConfig.relationDisplayMode)) {
          updates.relationDisplayMode = presetConfig.relationDisplayMode;
        }
      }

      // Apply edit mode
      if (presetConfig.relationEditMode) {
        updates.relationEditMode = presetConfig.relationEditMode;
      }

      if ('relationLoadStrategy' in presetConfig) {
        updates.relationLoadStrategy = presetConfig.relationLoadStrategy;
      }

      if ('relationEditOptions' in presetConfig) {
        updates.relationEditOptions = {
          ...field.relationEditOptions,
          ...presetConfig.relationEditOptions,
        };
      }

      // Reset actions to only valid ones
      const validActions = getValidActions(relationType);
      updates.relationActions = {
        filter: validActions.includes('filter'),
        view: validActions.includes('view'),
        edit: validActions.includes('edit'),
        viewAll: validActions.includes('viewAll'),
      };

      onUpdateField(updates);
    }
  };

  // Handle preview fields
  const addPreviewField = () => {
    if (!previewField) {
      return;
    }

    const currentFields =
      field.relationEditOptions?.previewFields ||
      defaults.relationEditOptions?.previewFields ||
      [];
    if (!currentFields.includes(previewField)) {
      onUpdateField({
        relationEditOptions: {
          ...field.relationEditOptions,
          previewFields: [...currentFields, previewField],
        },
      });
    }
    setPreviewField('');
  };

  const removePreviewField = (fieldToRemove: string) => {
    const currentFields = field.relationEditOptions?.previewFields || [];
    onUpdateField({
      relationEditOptions: {
        ...field.relationEditOptions,
        previewFields: currentFields.filter((f) => f !== fieldToRemove),
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Relation Type Badge */}
      <div className="flex items-center gap-2">
        <span className="font-medium text-sm">Relation Type:</span>
        <Badge variant="secondary">{relationType}</Badge>
        <span className="text-muted-foreground text-sm">→ {field.type}</span>
      </div>

      <Tabs className="w-full" defaultValue="display">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="display">Display</TabsTrigger>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-4" value="display">
          {/* Display Mode */}
          <div className="space-y-2">
            <Label>Display Mode</Label>
            <Select
              onValueChange={(value) =>
                onUpdateField({ relationDisplayMode: value as any })
              }
              value={field.relationDisplayMode || defaults.relationDisplayMode}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getValidDisplayModes(relationType)
                  .filter(Boolean)
                  .map(
                    (mode) =>
                      mode && (
                        <SelectItem key={mode} value={mode}>
                          {mode === 'dropdown' && 'Dropdown (with actions)'}
                          {mode === 'tags' && 'Tags (pills)'}
                          {mode === 'count' && 'Count (with preview)'}
                          {mode === 'inline' && 'Inline (full display)'}
                          {mode === 'badge' && 'Badge (compact)'}
                          {mode === 'link' && 'Link (simple)'}
                        </SelectItem>
                      )
                  )}
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-sm">
              {getDisplayModeHelpText(relationType)}
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <div className="font-medium text-sm">Available Actions</div>
            <div className="space-y-2">
              {(['filter', 'view', 'edit', 'viewAll'] as const).map(
                (action) => {
                  const validActions = getValidActions(relationType);
                  const isValid = validActions.includes(action);
                  const helpText = getActionHelpText(relationType, action);

                  return (
                    <div className="space-y-1" key={action}>
                      <label
                        className={`flex items-center space-x-2 ${isValid ? '' : 'opacity-50'}`}
                      >
                        <Checkbox
                          checked={
                            field.relationActions?.[action] !== false && isValid
                          }
                          disabled={!isValid}
                          onCheckedChange={(checked) =>
                            onUpdateField({
                              relationActions: {
                                ...field.relationActions,
                                [action]: !!checked,
                              },
                            })
                          }
                        />
                        <span className="text-sm">
                          Allow{' '}
                          {action === 'viewAll'
                            ? 'View All'
                            : action.charAt(0).toUpperCase() + action.slice(1)}
                        </span>
                      </label>
                      {helpText && (
                        <p className="ml-6 text-muted-foreground text-xs">
                          {helpText}
                        </p>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent className="space-y-4" value="edit">
          {/* Edit Mode */}
          <div className="space-y-2">
            <Label>Edit Mode</Label>
            <Select
              onValueChange={(value) =>
                onUpdateField({ relationEditMode: value as any })
              }
              value={field.relationEditMode || defaults.relationEditMode}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="select">Select (dropdown)</SelectItem>
                <SelectItem value="autocomplete">
                  Autocomplete (search)
                </SelectItem>
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
                  onCheckedChange={(checked) =>
                    onUpdateField({
                      relationEditOptions: {
                        ...field.relationEditOptions,
                        searchable: !!checked,
                      },
                    })
                  }
                />
                <span className="text-sm">Searchable</span>
              </label>
              <label className="flex items-center space-x-2">
                <Checkbox
                  checked={field.relationEditOptions?.createable === true}
                  onCheckedChange={(checked) =>
                    onUpdateField({
                      relationEditOptions: {
                        ...field.relationEditOptions,
                        createable: !!checked,
                      },
                    })
                  }
                />
                <span className="text-sm">Allow Create New</span>
              </label>
            </div>
          </div>

          {/* Max Display */}
          <div className="space-y-2">
            <Label>Max Display Items</Label>
            <Input
              max="100"
              min="1"
              onChange={(e) =>
                onUpdateField({
                  relationEditOptions: {
                    ...field.relationEditOptions,
                    maxDisplay: Number.parseInt(e.target.value, 10) || 5,
                  },
                })
              }
              type="number"
              value={
                field.relationEditOptions?.maxDisplay ||
                defaults.relationEditOptions?.maxDisplay ||
                5
              }
            />
          </div>
        </TabsContent>

        <TabsContent className="space-y-4" value="advanced">
          {/* Preview Fields */}
          <div className="space-y-2">
            <Label>Preview Fields</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  onChange={(e) => setPreviewField(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addPreviewField();
                    }
                  }}
                  placeholder="Add field name..."
                  value={previewField}
                />
                <Button
                  disabled={!previewField}
                  onClick={addPreviewField}
                  size="sm"
                  type="button"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(
                  field.relationEditOptions?.previewFields ||
                  defaults.relationEditOptions?.previewFields ||
                  []
                ).map((fieldName) => (
                  <Badge key={fieldName} variant="secondary">
                    {fieldName}
                    <button
                      className="ml-1 hover:text-destructive"
                      onClick={() => removePreviewField(fieldName)}
                      type="button"
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
              onValueChange={(value) =>
                onUpdateField({ relationLoadStrategy: value as any })
              }
              value={
                field.relationLoadStrategy || defaults.relationLoadStrategy
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eager">Eager (load with parent)</SelectItem>
                <SelectItem value="lazy">
                  Lazy (load on first access)
                </SelectItem>
                <SelectItem value="ondemand">
                  On Demand (load on user action)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Presets */}
          <div className="space-y-2">
            <Label>Apply Preset</Label>
            <div className="flex gap-2">
              <Button
                onClick={() => applyPreset('compact')}
                size="sm"
                type="button"
                variant="outline"
              >
                Compact
              </Button>
              <Button
                onClick={() => applyPreset('rich')}
                size="sm"
                type="button"
                variant="outline"
              >
                Rich
              </Button>
              <Button
                onClick={() => applyPreset('performance')}
                size="sm"
                type="button"
                variant="outline"
              >
                Performance
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
