import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { AdminField } from '@/lib/admin/types';
import { FormField } from './form-field';

interface FormSectionProps {
  title?: string;
  description?: string;
  fields: (AdminField & {
    inputType: string;
    options?: string[];
    value?: any;
    relatedModel?: string;
  })[];
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
            const fullWidth = ['json', 'editor', 'textarea'].includes(
              field.inputType
            );

            return (
              <div className={fullWidth ? 'md:col-span-2' : ''} key={field.id}>
                <FormField
                  defaultValue={field.value}
                  label={field.title}
                  name={field.name}
                  options={field.options}
                  placeholder={`Enter ${field.title.toLowerCase()}`}
                  relatedModel={field.relatedModel}
                  required={field.required}
                  type={field.inputType}
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
