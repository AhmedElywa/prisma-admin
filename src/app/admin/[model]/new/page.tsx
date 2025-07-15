import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { FormGenerator } from '@/app/admin/_components/form-generator';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { createModelRecord } from '@/lib/actions/crud';
import {
  canCreateModel,
  getCreateFields,
  getEnumValues,
  getFieldInputType,
  getModelSettings,
} from '@/lib/admin/settings';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ model: string }>;
}) {
  const { model } = await params;
  const modelSettings = await getModelSettings(model);
  if (!modelSettings) {
    return { title: 'Not Found' };
  }

  return {
    title: `Create ${modelSettings.name} - Admin`,
  };
}

export default async function CreateModelPage({
  params,
}: {
  params: Promise<{ model: string }>;
}) {
  const { model } = await params;
  const modelName = model.charAt(0).toUpperCase() + model.slice(1);
  const modelSettings = await getModelSettings(modelName);

  if (!(modelSettings && (await canCreateModel(modelName)))) {
    notFound();
  }

  // Get create fields from settings
  const fields = await getCreateFields(modelName);

  // Build form fields with additional metadata
  const formFields = await Promise.all(
    fields.map(async (field) => {
      const inputType = await getFieldInputType(field, modelName);
      let options: string[] | undefined;

      if (field.kind === 'enum') {
        options = await getEnumValues(field.type);
      }

      return {
        ...field,
        inputType,
        options,
        relatedModel:
          field.kind === 'object'
            ? field.type
            : // For foreign key fields, find the related model from the relation field
              modelSettings.fields.find((f) => f.relationFrom === field.name)
                ?.type,
      };
    })
  );

  async function create(formData: FormData) {
    'use server';
    await createModelRecord(modelName, formData);
    redirect(`/admin/${model}`);
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link href={`/admin/${model}`}>
          <Button size="sm" variant="ghost">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to {modelSettings.name}
          </Button>
        </Link>
      </div>

      <Card className="mx-auto max-w-2xl p-6">
        <h1 className="mb-6 font-bold text-2xl">Create {modelSettings.name}</h1>

        <FormGenerator
          action={create}
          cancelHref={`/admin/${model}`}
          fields={formFields}
          modelName={modelName}
          submitLabel={`Create ${modelSettings.name}`}
        />
      </Card>
    </div>
  );
}
