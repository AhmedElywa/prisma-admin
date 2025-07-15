import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField } from './form-field'
import { AdminField } from '@/lib/admin/types'

interface FormSectionProps {
  title?: string
  description?: string
  fields: (AdminField & {
    inputType: string
    options?: string[]
    value?: any
    relatedModel?: string
  })[]
}

export function FormSection({ title, description, fields }: FormSectionProps) {
  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className={title ? '' : 'pt-6'}>
        <div className="grid gap-6 md:grid-cols-2">
          {fields.map((field) => {
            // Full width for certain field types
            const fullWidth = ['json', 'editor', 'textarea'].includes(field.inputType)
            
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
                />
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}