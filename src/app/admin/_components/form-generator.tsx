import { FormField } from './form-field'
import { AdminField } from '@/lib/admin/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

interface FormGeneratorProps {
  fields: (AdminField & {
    inputType: string
    options?: string[]
    value?: any
    relatedModel?: string
  })[]
  action: (formData: FormData) => Promise<void>
  modelName: string
  submitLabel?: string
  cancelHref: string
  inModal?: boolean
}

export function FormGenerator({
  fields,
  action,
  modelName,
  submitLabel = 'Submit',
  cancelHref,
  inModal = false,
}: FormGeneratorProps) {
  return (
    <form action={action} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {fields.map((field) => {
          // Full width for certain field types
          const fullWidth = ['json', 'editor', 'textarea', 'richtext', 'file', 'array'].includes(field.inputType)
          
          return (
            <div
              key={field.id}
              className={fullWidth ? 'md:col-span-2' : ''}
            >
              <FormField
                name={field.name}
                label={field.title}
                type={field.inputType}
                required={field.required}
                options={field.options}
                defaultValue={field.value}
                placeholder={`Enter ${field.title.toLowerCase()}`}
                relatedModel={field.relatedModel}
                accept={field.inputType === 'file' ? 'image/*,application/pdf' : undefined}
                multiple={field.list}
                fieldType={field.type}
                field={field}
                inModal={inModal}
              />
            </div>
          )
        })}
      </div>
      
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Link href={cancelHref}>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
        <Button type="submit">
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}