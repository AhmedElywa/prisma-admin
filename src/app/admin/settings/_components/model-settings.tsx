'use client'

import React, { useState } from 'react'
import { AdminModel } from '@/lib/admin/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldConfig } from './field-config'
import { Button } from '@/components/ui/button'
import { Save, AlertCircle, Shield, Eye, Database, ChevronDown } from 'lucide-react'
import { saveModelSettings } from '@/lib/actions/settings'
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

interface ModelSettingsProps {
  model: AdminModel
}

export function ModelSettings({ model: initialModel }: ModelSettingsProps) {
  const [model, setModel] = useState(initialModel)
  const [isSaving, setIsSaving] = useState(false)
  
  // Update state when prop changes (when switching models)
  React.useEffect(() => {
    setModel(initialModel)
  }, [initialModel.id])
  
  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Save the current model along with other models
      await saveModelSettings([model])
      toast.success('Settings saved successfully')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }
  
  const hasChanges = JSON.stringify(model) !== JSON.stringify(initialModel)
  
  return (
    <div className="space-y-6">
      {/* Save Changes Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={!hasChanges || isSaving}
          size="sm"
        >
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
      
      
      {/* Field Configuration Section - Full Width */}
      <Card>
        <CardHeader>
          <CardTitle>Field Configuration</CardTitle>
          <CardDescription>Configure display settings and permissions for each field</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <FieldConfig
            model={model}
            onUpdateField={(fieldId, updates) => {
              setModel({
                ...model,
                fields: model.fields.map(f =>
                  f.id === fieldId ? { ...f, ...updates } : f
                )
              })
            }}
            onReorderFields={(fields) => {
              setModel({ ...model, fields })
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
  )
}
