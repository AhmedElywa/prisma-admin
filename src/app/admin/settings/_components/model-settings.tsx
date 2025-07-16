'use client';

import { AlertCircle, Save } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { saveModelSettings } from '@/lib/actions/settings';
import type { AdminModel } from '@/lib/admin/types';
import { FieldConfig } from './field-config';

interface ModelSettingsProps {
  model: AdminModel;
}

export function ModelSettings({ model: initialModel }: ModelSettingsProps) {
  const [model, setModel] = useState(initialModel);
  const [isSaving, setIsSaving] = useState(false);

  // Update state when prop changes (when switching models)
  React.useEffect(() => {
    setModel(initialModel);
  }, [initialModel.id, initialModel]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save the current model along with other models
      await saveModelSettings([model]);
      toast.success('Settings saved successfully');
    } catch (_error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = JSON.stringify(model) !== JSON.stringify(initialModel);

  return (
    <div className="space-y-6">
      {/* Save Changes Button */}
      <div className="flex justify-end">
        <Button
          disabled={!hasChanges || isSaving}
          onClick={handleSave}
          size="sm"
        >
          <Save className="me-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      {/* Field Configuration Section - Full Width */}
      <Card>
        <CardHeader>
          <CardTitle>Field Configuration</CardTitle>
          <CardDescription>
            Configure display settings and permissions for each field
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <FieldConfig
            model={model}
            onReorderFields={(fields) => {
              setModel({ ...model, fields });
            }}
            onUpdateField={(fieldId, updates) => {
              setModel({
                ...model,
                fields: model.fields.map((f) =>
                  f.id === fieldId ? { ...f, ...updates } : f
                ),
              });
            }}
          />
        </CardContent>
      </Card>

      {hasChanges && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You have unsaved changes. Click "Save Changes" to apply them.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
