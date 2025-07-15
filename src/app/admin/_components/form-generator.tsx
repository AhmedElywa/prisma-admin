import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { AdminField } from '@/lib/admin/types';
import { FormField } from './form-field';

interface FormGeneratorProps {
  fields: (AdminField & {
    inputType: string;
    options?: string[];
    value?: any;
    relatedModel?: string;
  })[];
  action: (formData: FormData) => Promise<void>;
  modelName: string;
  submitLabel?: string;
  cancelHref: string;
  inModal?: boolean;
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
          const fullWidth = [
            'json',
            'editor',
            'textarea',
            'richtext',
            'file',
            'array',
          ].includes(field.inputType);

          return (
            <div className={fullWidth ? 'md:col-span-2' : ''} key={field.id}>
              <FormField
                accept={
                  field.inputType === 'file'
                    ? 'image/*,application/pdf'
                    : undefined
                }
                defaultValue={field.value}
                field={field}
                fieldType={field.type}
                inModal={inModal}
                label={field.title}
                multiple={field.list}
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

      <div className="flex justify-end gap-2 border-t pt-4">
        <Link href={cancelHref}>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
