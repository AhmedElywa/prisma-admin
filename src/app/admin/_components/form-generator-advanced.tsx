'use client'

import { FormSection } from './form-section'
import { AdminField } from '@/lib/admin/types'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { groupFormFields, FieldGroup } from '@/lib/admin/form-utils'
import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'

interface FormGeneratorAdvancedProps {
  fields: (AdminField & {
    inputType: string
    options?: string[]
    value?: any
  })[]
  action: (formData: FormData) => Promise<void>
  modelName: string
  submitLabel?: string
  cancelHref: string
  useGroups?: boolean
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? 'Saving...' : label}
    </Button>
  )
}

export function FormGeneratorAdvanced({
  fields,
  action,
  modelName,
  submitLabel = 'Submit',
  cancelHref,
  useGroups = true,
}: FormGeneratorAdvancedProps) {
  const groups = useGroups ? groupFormFields(fields) : [{ fields }]
  
  return (
    <form action={action} className="space-y-6">
      {groups.map((group, index) => (
        <FormSection
          key={index}
          title={group.title}
          description={group.description}
          fields={group.fields.map(field => {
            const fieldWithMeta = fields.find(f => f.id === field.id)
            return {
              ...field,
              inputType: fieldWithMeta?.inputType || 'text',
              options: fieldWithMeta?.options,
              value: fieldWithMeta?.value,
            }
          })}
        />
      ))}
      
      <div className="flex justify-end gap-2 pt-4">
        <Link href={cancelHref}>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  )
}