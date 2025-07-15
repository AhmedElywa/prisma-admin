import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { getModelData, deleteModelRecord } from '@/lib/actions/crud'
import { getTableFields, getColumnType, getDisplayValue, getModelSettings } from '@/lib/admin/settings'
import { DataTable } from './data-table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { InlineCreateForm } from './inline-create-form'
import { useState } from 'react'

interface RelationTabsProps {
  parentModel: string
  parentId: string | number
  relations: Array<{
    model: string
    field: string
    label: string
    type: 'one-to-many' | 'many-to-many'
  }>
}

export async function RelationTabs({
  parentModel,
  parentId,
  relations,
}: RelationTabsProps) {
  if (relations.length === 0) return null
  
  // Load data for each relation
  const relationsWithData = await Promise.all(
    relations.map(async (relation) => {
      try {
        // Get table fields for the related model
        const fields = await getTableFields(relation.model)
        
        // Build columns configuration
        const columns = fields.map(field => ({
          key: field.name,
          label: field.title,
          type: getColumnType(field),
          sortable: field.sort
        }))
        
        // Get the related model to determine the relation field type
        const relatedModelSettings = await getModelSettings(relation.model)
        const relationField = relatedModelSettings?.fields.find(f => f.name === relation.field)
        
        // Convert parentId based on relation field type
        let convertedId: any = parentId
        if (relationField?.type === 'Int' || relationField?.type === 'BigInt') {
          convertedId = parseInt(parentId.toString())
        }
        
        // Get related data
        const { data, totalCount, page, perPage, totalPages } = await getModelData(
          relation.model,
          {
            page: 1,
            perPage: 10,
            filters: [{
              field: relation.field,
              operator: 'equals',
              value: convertedId,
              type: 'relation'
            }]
          }
        )
        
        return {
          ...relation,
          columns,
          data,
          totalCount,
          page,
          perPage,
          totalPages,
        }
      } catch (error) {
        console.error(`Failed to load ${relation.model} data:`, error)
        return {
          ...relation,
          columns: [],
          data: [],
          totalCount: 0,
          page: 1,
          perPage: 10,
          totalPages: 0,
        }
      }
    })
  )
  
  if (relations.length === 1) {
    // Single relation - no tabs needed
    const relation = relationsWithData[0]
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{relation.label}</CardTitle>
            <CardDescription>
              {relation.totalCount} related {relation.model.toLowerCase()} record{relation.totalCount !== 1 ? 's' : ''}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Quick Add
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                  <DialogTitle>Add {relation.model}</DialogTitle>
                  <DialogDescription>
                    Create a new {relation.model.toLowerCase()} linked to this {parentModel.toLowerCase()}
                  </DialogDescription>
                </DialogHeader>
                <div className="overflow-y-auto flex-1 pr-2">
                  <InlineCreateForm
                    modelName={relation.model}
                    parentField={relation.field}
                    parentId={parentId}
                    parentModel={parentModel}
                  />
                </div>
              </DialogContent>
            </Dialog>
            <Link href={`/admin/${relation.model.toLowerCase()}/new?${relation.field}=${parentId}`}>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add {relation.model}
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {relation.totalCount === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No {relation.model.toLowerCase()} records found</p>
              <p className="text-sm mt-1">Create your first one using the button above</p>
            </div>
          ) : (
            <DataTable
              data={relation.data}
              columns={relation.columns}
              totalItems={relation.totalCount}
              currentPage={relation.page}
              itemsPerPage={relation.perPage}
              totalPages={relation.totalPages}
              modelName={relation.model}
              canEdit={true}
              canDelete={true}
              compact={true}
            />
          )}
        </CardContent>
      </Card>
    )
  }
  
  // Multiple relations - use tabs
  return (
    <Card>
      <CardHeader>
        <CardTitle>Related Records</CardTitle>
        <CardDescription>
          Manage related data for this {parentModel.toLowerCase()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={relations[0].model} className="w-full">
          <TabsList className={`grid w-full grid-cols-${relations.length}`}>
            {relationsWithData.map(relation => (
              <TabsTrigger key={relation.model} value={relation.model}>
                {relation.label} ({relation.totalCount})
              </TabsTrigger>
            ))}
          </TabsList>
          
          {relationsWithData.map(relation => (
            <TabsContent key={relation.model} value={relation.model} className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-muted-foreground">
                  {relation.totalCount} record{relation.totalCount !== 1 ? 's' : ''}
                </p>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Quick Add
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add {relation.model}</DialogTitle>
                        <DialogDescription>
                          Create a new {relation.model.toLowerCase()} linked to this {parentModel.toLowerCase()}
                        </DialogDescription>
                      </DialogHeader>
                      <InlineCreateForm
                        modelName={relation.model}
                        parentField={relation.field}
                        parentId={parentId}
                        parentModel={parentModel}
                      />
                    </DialogContent>
                  </Dialog>
                  <Link href={`/admin/${relation.model.toLowerCase()}/new?${relation.field}=${parentId}`}>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add {relation.model}
                    </Button>
                  </Link>
                </div>
              </div>
              
              {relation.totalCount === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No {relation.model.toLowerCase()} records found</p>
                  <p className="text-sm mt-1">Create your first one using the button above</p>
                </div>
              ) : (
                <DataTable
                  data={relation.data}
                  columns={relation.columns}
                  totalItems={relation.totalCount}
                  currentPage={relation.page}
                  itemsPerPage={relation.perPage}
                  totalPages={relation.totalPages}
                  modelName={relation.model}
                  canEdit={true}
                  canDelete={true}
                  compact={true}
                />
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}