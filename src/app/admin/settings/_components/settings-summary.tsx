import { ArrowUpDown, Database, Edit, Eye, Filter, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { AdminSettings } from '@/lib/admin/types';

interface SettingsSummaryProps {
  settings: AdminSettings;
}

export function SettingsSummary({ settings }: SettingsSummaryProps) {
  const totalFields = settings.models.reduce(
    (acc, model) => acc + model.fields.length,
    0
  );
  const configurableFields = settings.models.reduce(
    (acc, model) =>
      acc + model.fields.filter((f) => !(f.relationField || f.isId)).length,
    0
  );

  return (
    <div className="mb-6 grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Models</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">{settings.models.length}</div>
          <p className="text-muted-foreground text-xs">Configured models</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Fields</CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">{totalFields}</div>
          <p className="text-muted-foreground text-xs">
            Total fields ({configurableFields} configurable)
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Enums</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">{settings.enums.length}</div>
          <p className="text-muted-foreground text-xs">Defined enumerations</p>
        </CardContent>
      </Card>
    </div>
  );
}

export function ModelSummaryCard({ model }: { model: any }) {
  const stats = {
    readable: model.fields.filter((f: any) => f.read).length,
    creatable: model.fields.filter((f: any) => f.create).length,
    updatable: model.fields.filter((f: any) => f.update).length,
    filterable: model.fields.filter((f: any) => f.filter).length,
    sortable: model.fields.filter((f: any) => f.sort).length,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{model.name}</CardTitle>
          <div className="flex gap-2">
            {model.create && <Badge variant="outline">Create</Badge>}
            {model.update && <Badge variant="outline">Update</Badge>}
            {model.delete && <Badge variant="outline">Delete</Badge>}
          </div>
        </div>
        <CardDescription>
          {model.fields.length} fields • ID: {model.idField}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-2 text-center">
          <div>
            <Eye className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
            <div className="font-bold text-2xl">{stats.readable}</div>
            <p className="text-muted-foreground text-xs">Read</p>
          </div>
          <div>
            <Edit className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
            <div className="font-bold text-2xl">{stats.creatable}</div>
            <p className="text-muted-foreground text-xs">Create</p>
          </div>
          <div>
            <Edit className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
            <div className="font-bold text-2xl">{stats.updatable}</div>
            <p className="text-muted-foreground text-xs">Update</p>
          </div>
          <div>
            <Filter className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
            <div className="font-bold text-2xl">{stats.filterable}</div>
            <p className="text-muted-foreground text-xs">Filter</p>
          </div>
          <div>
            <ArrowUpDown className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
            <div className="font-bold text-2xl">{stats.sortable}</div>
            <p className="text-muted-foreground text-xs">Sort</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
