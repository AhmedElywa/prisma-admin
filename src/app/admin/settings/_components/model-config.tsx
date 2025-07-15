'use client';

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
import type { AdminModel } from '@/lib/admin/types';

interface ModelConfigProps {
  model: AdminModel;
  onChange: (updates: AdminModel) => void;
}

export function ModelConfig({ model, onChange }: ModelConfigProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="displayName">Display Name</Label>
        <Input
          className="bg-muted"
          disabled
          id="displayName"
          value={model.name}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="idField">ID Field</Label>
        <Select
          onValueChange={(value) => onChange({ ...model, idField: value })}
          value={model.idField}
        >
          <SelectTrigger id="idField">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {model.fields
              .filter((f) => f.isId || f.unique)
              .map((field) => (
                <SelectItem key={field.id} value={field.name}>
                  {field.name} ({field.type})
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Display Fields</Label>
        <p className="text-muted-foreground text-sm">
          Select fields to show when displaying this model in relations
        </p>
        <div className="mt-3 grid gap-2">
          {model.fields
            .filter((f) => !(f.relationField || f.list))
            .map((field) => (
              <label
                className="flex cursor-pointer items-center space-x-2 rounded-md p-2 transition-colors hover:bg-muted/50"
                key={field.id}
              >
                <Checkbox
                  checked={model.displayFields.includes(field.name)}
                  onCheckedChange={(checked) => {
                    const displayFields = checked
                      ? [...model.displayFields, field.name]
                      : model.displayFields.filter((f) => f !== field.name);
                    onChange({ ...model, displayFields });
                  }}
                />
                <span className="text-sm">{field.title}</span>
              </label>
            ))}
        </div>
      </div>
    </div>
  );
}
