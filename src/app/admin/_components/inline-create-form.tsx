'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { FormGenerator } from './form-generator'
import { createModelRecord } from '@/lib/actions/crud'
import { getFormFieldsData } from '@/lib/actions/form-data'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface InlineCreateFormProps {
  modelName: string
  parentField: string
  parentId: string | number
  parentModel: string
  onSuccess?: () => void
}

export function InlineCreateForm({
  modelName,
  parentField,
  parentId,
  parentModel,
  onSuccess
}: InlineCreateFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [fields, setFields] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadFields()
  }, [modelName])

  const loadFields = async () => {
    try {
      setLoading(true)
      const formFields = await getFormFieldsData(modelName)
      
      // Filter out parent field
      const filteredFields = formFields.filter(field => field.name !== parentField)
      
      setFields(filteredFields)
    } catch (err) {
      console.error('Failed to load fields:', err)
      setError('Failed to load form fields')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(formData: FormData) {
    try {
      // Add the parent relation
      formData.set(parentField, parentId.toString())
      
      await createModelRecord(modelName, formData)
      
      toast.success(`${modelName} created successfully`)
      
      // Refresh the page to show the new record
      router.refresh()
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Failed to create record:', error)
      toast.error('Failed to create record')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-muted/50 p-3 rounded-md">
        <p className="text-sm text-muted-foreground">
          This {modelName.toLowerCase()} will be automatically linked to the current {parentModel.toLowerCase()}
        </p>
      </div>
      
      <FormGenerator
        fields={fields}
        action={handleSubmit}
        modelName={modelName}
        submitLabel={`Create ${modelName}`}
        cancelHref="#"
        inModal={true}
      />
    </div>
  )
}