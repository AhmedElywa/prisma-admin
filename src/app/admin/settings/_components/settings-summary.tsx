import { AdminSettings } from '@/lib/admin/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Database, Shield, Eye, Edit, Filter, ArrowUpDown } from 'lucide-react'

interface SettingsSummaryProps {
  settings: AdminSettings
}

export function SettingsSummary({ settings }: SettingsSummaryProps) {
  const totalFields = settings.models.reduce((acc, model) => acc + model.fields.length, 0)
  const configurableFields = settings.models.reduce(
    (acc, model) => acc + model.fields.filter(f => !f.relationField && !f.isId).length,
    0
  )
  
  return (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Models</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{settings.models.length}</div>
          <p className="text-xs text-muted-foreground">
            Configured models
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Fields</CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalFields}</div>
          <p className="text-xs text-muted-foreground">
            Total fields ({configurableFields} configurable)
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Enums</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{settings.enums.length}</div>
          <p className="text-xs text-muted-foreground">
            Defined enumerations
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export function ModelSummaryCard({ model }: { model: any }) {
  const stats = {
    readable: model.fields.filter((f: any) => f.read).length,
    creatable: model.fields.filter((f: any) => f.create).length,
    updatable: model.fields.filter((f: any) => f.update).length,
    filterable: model.fields.filter((f: any) => f.filter).length,
    sortable: model.fields.filter((f: any) => f.sort).length,
  }
  
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
            <Eye className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <div className="text-2xl font-bold">{stats.readable}</div>
            <p className="text-xs text-muted-foreground">Read</p>
          </div>
          <div>
            <Edit className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <div className="text-2xl font-bold">{stats.creatable}</div>
            <p className="text-xs text-muted-foreground">Create</p>
          </div>
          <div>
            <Edit className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <div className="text-2xl font-bold">{stats.updatable}</div>
            <p className="text-xs text-muted-foreground">Update</p>
          </div>
          <div>
            <Filter className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <div className="text-2xl font-bold">{stats.filterable}</div>
            <p className="text-xs text-muted-foreground">Filter</p>
          </div>
          <div>
            <ArrowUpDown className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <div className="text-2xl font-bold">{stats.sortable}</div>
            <p className="text-xs text-muted-foreground">Sort</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}