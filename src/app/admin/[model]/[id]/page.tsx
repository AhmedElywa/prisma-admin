import { notFound, redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { 
  getModelSettings, 
  getUpdateFields,
  canUpdateModel,
  getFieldInputType,
  getEnumValues,
  getDisplayValue,
  getAdminSettings
} from '@/lib/admin/settings'
import { updateModelRecord, getModelRecord } from '@/lib/actions/crud'
import { FormGenerator } from '@/app/admin/_components/form-generator'
import { RelationTabs } from '@/app/admin/_components/relation-tabs'

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ model: string; id: string }> 
}) {
  const { model } = await params
  const modelSettings = await getModelSettings(model)
  if (!modelSettings) return { title: 'Not Found' }
  
  return {
    title: `Edit ${modelSettings.name} - Admin`,
  }
}

export default async function EditModelPage({
  params,
}: {
  params: Promise<{ model: string; id: string }>
}) {
  const { model, id } = await params
  const modelName = model.charAt(0).toUpperCase() + model.slice(1)
  const modelSettings = await getModelSettings(modelName)
  
  if (!modelSettings || !await canUpdateModel(modelName)) {
    notFound()
  }
  
  // Get the record to edit
  const record = await getModelRecord(modelName, id)
  if (!record) {
    notFound()
  }
  
  // Get update fields from settings
  const fields = await getUpdateFields(modelName)
  
  // Build form fields with values and metadata
  const formFields = await Promise.all(
    fields.map(async (field) => {
      const inputType = await getFieldInputType(field, modelName)
      let options: string[] | undefined
      let value = record[field.name]
      
      if (field.kind === 'enum') {
        options = await getEnumValues(field.type)
      }
      
      // Convert values for display
      if (field.type === 'DateTime' && value) {
        value = new Date(value).toISOString().slice(0, 16)
      } else if (field.type === 'Json' && value) {
        value = JSON.stringify(value, null, 2)
      }
      
      // For many-to-many relations, we need to load the full records
      if (field.relationField && field.list && value) {
        // Value is an array of related records for many-to-many
        // Keep it as is - RelationConnect will handle it
      }
      
      return {
        ...field,
        inputType,
        options,
        value,
        relatedModel: field.kind === 'object' ? field.type : 
          // For foreign key fields, find the related model from the relation field
          modelSettings.fields.find(f => f.relationFrom === field.name)?.type
      }
    })
  )
  
  async function update(formData: FormData) {
    'use server'
    
    try {
      await updateModelRecord(modelName, id, formData)
      redirect(`/admin/${model}`)
    } catch (error) {
      console.error('Failed to update record:', error)
      throw error
    }
  }
  
  const displayValue = await getDisplayValue(modelName, record)
  
  // Get one-to-many relations
  const settings = await getAdminSettings()
  const oneToManyRelations = await Promise.all(
    modelSettings.fields
      .filter(field => field.relationField && field.list && field.kind === 'object')
      .map(async field => {
        // Find the related model settings
        const relatedModel = settings.models.find(m => m.id === field.type)
        if (!relatedModel) return null
        
        // Find the field in the related model that points back to this model
        const backRefField = relatedModel.fields.find(f => 
          f.type === modelName && f.relationName === field.relationName && f.relationFrom
        )
        
        if (!backRefField) return null
        
        return {
          model: field.type,
          field: backRefField.relationFrom!, // This is the foreign key field name
          label: field.title,
          type: 'one-to-many' as const
        }
      })
  )
  
  // Filter out nulls
  const validOneToManyRelations = oneToManyRelations.filter(r => r !== null) as any[]
  
  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link href={`/admin/${model}`}>
          <Button variant="ghost" size="sm">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to {modelSettings.name}
          </Button>
        </Link>
      </div>
      
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-2">Edit {modelSettings.name}</h1>
          <p className="text-muted-foreground mb-6">{displayValue}</p>
          
          <FormGenerator
            fields={formFields}
            action={update}
            modelName={modelName}
            submitLabel={`Update ${modelSettings.name}`}
            cancelHref={`/admin/${model}`}
          />
        </Card>
        
        {/* One-to-many relations */}
        {validOneToManyRelations.length > 0 && (
          <RelationTabs
            parentModel={modelName}
            parentId={id}
            relations={validOneToManyRelations}
          />
        )}
      </div>
    </div>
  )
}