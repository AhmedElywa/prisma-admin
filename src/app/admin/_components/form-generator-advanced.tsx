'use client';

import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { groupFormFields } from '@/lib/admin/form-utils';
import type { AdminField } from '@/lib/admin/types';
import { FormSection } from './form-section';

interface FormGeneratorAdvancedProps {
  fields: (AdminField & {
    inputType: string;
    options?: string[];
    value?: any;
  })[];
  action: (formData: FormData) => Promise<void>;
  modelName: string;
  submitLabel?: string;
  cancelHref: string;
  useGroups?: boolean;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? 'Saving...' : label}
    </Button>
  );
}

export function FormGeneratorAdvanced({
  fields,
  action,
  modelName,
  submitLabel = 'Submit',
  cancelHref,
  useGroups = true,
}: FormGeneratorAdvancedProps) {
  const groups = useGroups ? groupFormFields(fields) : [{ fields }];

  return (
    <form action={action} className="space-y-6">
      {groups.map((group, index) => (
        <FormSection
          description={group.description}
          fields={group.fields.map((field) => {
            const fieldWithMeta = fields.find((f) => f.id === field.id);
            return {
              ...field,
              inputType: fieldWithMeta?.inputType || 'text',
              options: fieldWithMeta?.options,
              value: fieldWithMeta?.value,
            };
          })}
          key={`group-${index}-${group.title}`}
          title={group.title}
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
  );
}
