'use client'

import { AdminModel } from '@/lib/admin/types'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ModelConfigProps {
  model: AdminModel
  onChange: (updates: AdminModel) => void
}

export function ModelConfig({ model, onChange }: ModelConfigProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="displayName">Display Name</Label>
        <Input
          id="displayName"
          value={model.name}
          disabled
          className="bg-muted"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="idField">ID Field</Label>
        <Select
          value={model.idField}
          onValueChange={(value) => onChange({ ...model, idField: value })}
        >
          <SelectTrigger id="idField">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {model.fields
              .filter(f => f.isId || f.unique)
              .map(field => (
                <SelectItem key={field.id} value={field.name}>
                  {field.name} ({field.type})
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label>Display Fields</Label>
        <p className="text-sm text-muted-foreground">
          Select fields to show when displaying this model in relations
        </p>
        <div className="grid gap-2 mt-3">
          {model.fields
            .filter(f => !f.relationField && !f.list)
            .map(field => (
              <label
                key={field.id}
                className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors"
              >
                <Checkbox
                  checked={model.displayFields.includes(field.name)}
                  onCheckedChange={(checked) => {
                    const displayFields = checked
                      ? [...model.displayFields, field.name]
                      : model.displayFields.filter(f => f !== field.name)
                    onChange({ ...model, displayFields })
                  }}
                />
                <span className="text-sm">{field.title}</span>
              </label>
            ))}
        </div>
      </div>
    </div>
  )
}