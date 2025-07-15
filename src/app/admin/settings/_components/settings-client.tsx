'use client';

import { ChevronsUpDown, Database, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { saveModelSettings } from '@/lib/actions/settings';
import type { AdminModel, AdminSettings } from '@/lib/admin/types';
import { GeneralSettings } from './general-settings';
import { ModelSelector } from './model-selector';
import { ModelSettings } from './model-settings';

interface SettingsClientProps {
  settings: AdminSettings;
}

export function SettingsClient({ settings }: SettingsClientProps) {
  const [models, setModels] = useState<AdminModel[]>(settings.models);
  const [selectedModel, setSelectedModel] = useState<string | null>(
    settings.models[0]?.id || null
  );
  const [activeTab, setActiveTab] = useState('models');
  const [displayFieldsOpen, setDisplayFieldsOpen] = useState(false);

  const currentModel = models.find((m) => m.id === selectedModel);

  const updateModel = (updates: Partial<AdminModel>) => {
    if (!currentModel) {
      return;
    }

    setModels((prevModels) =>
      prevModels.map((m) =>
        m.id === currentModel.id ? { ...m, ...updates } : m
      )
    );
  };

  const _handleSave = async () => {
    try {
      await saveModelSettings(models);
      toast.success('Settings saved successfully');
    } catch (_error) {
      toast.error('Failed to save settings');
    }
  };

  return (
    <Tabs className="space-y-6" onValueChange={setActiveTab} value={activeTab}>
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="models">Models</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>

      <TabsContent className="space-y-6" value="models">
        {/* Model Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Model Configuration
            </CardTitle>
            <CardDescription>
              Configure the basic settings for your selected model
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Top row: Model, Display Name, ID Field */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Model</Label>
                <ModelSelector
                  models={models}
                  onSelectModel={setSelectedModel}
                  selectedModel={selectedModel}
                />
              </div>

              {currentModel && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      onChange={(e) => updateModel({ name: e.target.value })}
                      placeholder="Display name for this model"
                      value={currentModel.name}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="idField">ID Field</Label>
                    <Select
                      onValueChange={(value) => updateModel({ idField: value })}
                      value={currentModel.idField}
                    >
                      <SelectTrigger className="w-full" id="idField">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currentModel.fields
                          .filter((f) => f.isId || f.unique)
                          .map((field) => (
                            <SelectItem key={field.id} value={field.name}>
                              {field.name} ({field.type})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>

            {/* Bottom row: Display Fields and Permissions */}
            {currentModel && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Display Fields Multi-Select */}
                <div className="space-y-2">
                  <Label>Display Fields</Label>
                  <Popover
                    onOpenChange={setDisplayFieldsOpen}
                    open={displayFieldsOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        className="w-full justify-between text-left font-normal hover:bg-transparent"
                        size="lg"
                        variant="outline"
                      >
                        <div className="flex flex-1 flex-wrap gap-1">
                          {currentModel.displayFields.length > 0 ? (
                            currentModel.displayFields.map((fieldName) => {
                              const field = currentModel.fields.find(
                                (f) => f.name === fieldName
                              );
                              return field ? (
                                <Badge
                                  className="mr-1 rounded-full"
                                  key={fieldName}
                                  variant="secondary"
                                >
                                  {field.title}
                                  <span
                                    className="ml-1 inline-flex cursor-pointer rounded-full p-0.5 hover:bg-destructive/20"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      updateModel({
                                        displayFields:
                                          currentModel.displayFields.filter(
                                            (f) => f !== fieldName
                                          ),
                                      });
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        updateModel({
                                          displayFields:
                                            currentModel.displayFields.filter(
                                              (f) => f !== fieldName
                                            ),
                                        });
                                      }
                                    }}
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                    }}
                                    role="button"
                                    tabIndex={0}
                                  >
                                    <X className="h-2 w-2" />
                                  </span>
                                </Badge>
                              ) : null;
                            })
                          ) : (
                            <span className="text-muted-foreground">
                              Select fields...
                            </span>
                          )}
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search fields..." />
                        <CommandEmpty>No field found.</CommandEmpty>
                        <CommandGroup>
                          {currentModel.fields
                            .filter((f) => !(f.relationField || f.list))
                            .map((field) => (
                              <CommandItem
                                className="data-[selected=true]:bg-accent/50"
                                key={field.id}
                                onSelect={() => {
                                  const isSelected =
                                    currentModel.displayFields.includes(
                                      field.name
                                    );
                                  if (isSelected) {
                                    updateModel({
                                      displayFields:
                                        currentModel.displayFields.filter(
                                          (f) => f !== field.name
                                        ),
                                    });
                                  } else {
                                    updateModel({
                                      displayFields: [
                                        ...currentModel.displayFields,
                                        field.name,
                                      ],
                                    });
                                  }
                                }}
                              >
                                <Checkbox
                                  checked={currentModel.displayFields.includes(
                                    field.name
                                  )}
                                  className="mr-2"
                                />
                                {field.title}
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Permissions */}
                <div className="space-y-2">
                  <Label>Model Permissions</Label>
                  <div className="flex h-10 items-center space-x-4 rounded-md border px-2.5 shadow-xs">
                    <label className="flex cursor-pointer items-center gap-2">
                      <Checkbox
                        checked={currentModel.create}
                        onCheckedChange={(checked) =>
                          updateModel({ create: !!checked })
                        }
                      />
                      <span className="text-sm">Create</span>
                    </label>

                    <label className="flex cursor-pointer items-center gap-2">
                      <Checkbox
                        checked={currentModel.update}
                        onCheckedChange={(checked) =>
                          updateModel({ update: !!checked })
                        }
                      />
                      <span className="text-sm">Update</span>
                    </label>

                    <label className="flex cursor-pointer items-center gap-2">
                      <Checkbox
                        checked={currentModel.delete}
                        onCheckedChange={(checked) =>
                          updateModel({ delete: !!checked })
                        }
                      />
                      <span className="text-sm">Delete</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Field Configuration */}
        {currentModel ? (
          <ModelSettings model={currentModel} />
        ) : (
          <Card>
            <CardContent className="flex h-[400px] items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Database className="mx-auto mb-4 h-12 w-12" />
                <p>Select a model to configure its settings</p>
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent className="space-y-6" value="settings">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>
              Configure global admin panel settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GeneralSettings />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
