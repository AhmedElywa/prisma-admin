import fs from 'node:fs/promises';
import type { DMMF } from '@prisma/generator-helper';
import { applyRelationDefaults } from './relation-defaults';
import type { AdminField, AdminModel, AdminSettings } from './types';

const SYSTEM_FIELDS = ['id', 'createdAt', 'updatedAt'];

function titleCase(str: string): string {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

function getFieldKind(field: DMMF.Field): string {
  if (field.relationName) {
    return 'object';
  }
  if (field.kind === 'enum') {
    return 'enum';
  }
  return 'scalar';
}

function shouldAllowCreate(field: DMMF.Field): boolean {
  if (SYSTEM_FIELDS.includes(field.name)) {
    return false;
  }
  if (field.isId && field.hasDefaultValue) {
    return false;
  }
  if (field.relationName) {
    return false;
  }
  return true;
}

function shouldAllowUpdate(field: DMMF.Field): boolean {
  if (SYSTEM_FIELDS.includes(field.name)) {
    return false;
  }
  if (field.isId) {
    return false;
  }
  if (field.relationName) {
    return false;
  }
  return true;
}

function getIdField(model: DMMF.Model): string {
  const idField = model.fields.find((f) => f.isId);
  if (idField) {
    return idField.name;
  }

  const uniqueField = model.fields.find((f) => f.isUnique);
  if (uniqueField) {
    return uniqueField.name;
  }

  return 'id';
}

function generateField(
  field: DMMF.Field,
  modelName: string,
  order: number
): AdminField {
  const baseField: AdminField = {
    id: `${modelName}.${field.name}`,
    name: field.name,
    title: titleCase(field.name),
    type: field.type,
    kind: getFieldKind(field),
    list: field.isList,
    required: field.isRequired,
    isId: field.isId,
    unique: field.isUnique,
    order,
    relationField: !!field.relationName,
    relationFrom: field.relationFromFields?.[0],
    relationTo: field.relationToFields?.[0],
    relationName: field.relationName,
    // Permissions
    read: true,
    filter: true,
    sort: !(field.isList || field.relationName),
    create: shouldAllowCreate(field),
    update: shouldAllowUpdate(field),
    editor: false,
    upload: false,
  };

  // Apply relation defaults if it's a relation field
  if (baseField.relationField) {
    return applyRelationDefaults(baseField);
  }

  return baseField;
}

function generateModel(model: DMMF.Model): AdminModel {
  const idField = getIdField(model);
  const hasId = model.fields.some((f) => f.isId || f.isUnique);

  // First, generate all fields
  const fields = model.fields.map((field, index) =>
    generateField(field, model.name, index)
  );

  // Collect all foreign key field names from relations
  const foreignKeyFields = new Set<string>();
  model.fields.forEach((field) => {
    if (field.relationFromFields && field.relationFromFields.length > 0) {
      for (const fk of field.relationFromFields) {
        foreignKeyFields.add(fk);
      }
    }
  });

  // Set read: false for foreign key fields
  const processedFields = fields.map((field) => {
    if (foreignKeyFields.has(field.name)) {
      return { ...field, read: false };
    }
    return field;
  });

  // Sort fields
  const sortedFields = processedFields.sort((a, b) => {
    // Put ID fields first
    if (a.isId) {
      return -1;
    }
    if (b.isId) {
      return 1;
    }
    // Then required fields
    if (a.required && !b.required) {
      return -1;
    }
    if (!a.required && b.required) {
      return 1;
    }
    // Then by order
    return a.order - b.order;
  });

  return {
    id: model.name,
    name: titleCase(model.name),
    idField,
    displayFields: [idField],
    create: true,
    update: hasId,
    delete: hasId,
    fields: sortedFields,
  };
}

export async function generateAdminSettings(
  schemaPath = './prisma/schema.prisma',
  outputPath = './adminSettings.json'
): Promise<AdminSettings> {
  // Read Prisma schema
  const schemaContent = await fs.readFile(schemaPath, 'utf-8');

  // Parse schema to get DMMF
  // Note: In production, you'd use Prisma's getDMMF function
  // For now, we'll use a simplified approach
  const dmmf = await getDMMF(schemaContent);

  const settings: AdminSettings = {
    models: dmmf.datamodel.models.map(generateModel),
    enums: dmmf.datamodel.enums.map((e) => ({
      name: e.name,
      fields: e.values.map((v) => v.name),
    })),
  };

  // Save to file
  await fs.writeFile(outputPath, JSON.stringify(settings, null, 2), 'utf-8');

  return settings;
}

// Helper function to merge field settings
function mergeFieldSettings(
  newField: AdminField,
  existingField: AdminField
): AdminField {
  return {
    ...newField,
    title: existingField.title,
    order: existingField.order,
    read: existingField.read,
    filter: existingField.filter,
    sort: existingField.sort,
    create: existingField.create,
    update: existingField.update,
    editor: existingField.editor,
    upload: existingField.upload,
    // Preserve relation settings if they exist
    relationDisplayMode:
      existingField.relationDisplayMode || newField.relationDisplayMode,
    relationActions: existingField.relationActions || newField.relationActions,
    relationEditMode:
      existingField.relationEditMode || newField.relationEditMode,
    relationEditOptions:
      existingField.relationEditOptions || newField.relationEditOptions,
    relationLoadStrategy:
      existingField.relationLoadStrategy || newField.relationLoadStrategy,
    relationCacheTTL:
      existingField.relationCacheTTL || newField.relationCacheTTL,
  };
}

// Helper function to process model fields
function processModelFields(
  newModel: AdminModel,
  existingModel: AdminModel | undefined,
  newSettings: AdminSettings
): AdminField[] {
  if (!existingModel) {
    return newModel.fields;
  }

  const existingFieldsMap = new Map(
    existingModel.fields.map((f) => [f.name, f])
  );
  const mergedFields: AdminField[] = [];

  // Process fields
  for (const newField of newModel.fields) {
    const existingField = existingFieldsMap.get(newField.name);
    if (existingField) {
      mergedFields.push(mergeFieldSettings(newField, existingField));
    } else {
      mergedFields.push(newField);
    }
  }

  // Collect and hide foreign key fields
  const foreignKeyFields = new Set<string>();
  const dmmfModel = newSettings.models.find((m) => m.id === newModel.id);
  if (dmmfModel) {
    dmmfModel.fields.forEach((field) => {
      if (field.relationFrom) {
        foreignKeyFields.add(field.relationFrom);
      }
    });
  }

  return mergedFields.map((field) => {
    if (foreignKeyFields.has(field.name)) {
      return { ...field, read: false };
    }
    return field;
  });
}

// Helper function to merge model settings
function mergeModelSettings(
  newModel: AdminModel,
  existingModel: AdminModel | undefined
): Partial<AdminModel> {
  if (!existingModel) {
    return {};
  }

  return {
    name: existingModel.name,
    displayFields: existingModel.displayFields,
    create: existingModel.create,
    update: existingModel.update,
    delete: existingModel.delete,
  };
}

// Merge existing settings with new schema
export async function mergeAdminSettings(
  schemaPath = './prisma/schema.prisma',
  settingsPath = './adminSettings.json'
): Promise<AdminSettings> {
  // Generate new settings from schema
  const newSettings = await generateAdminSettings(schemaPath, 'temp.json');

  // Try to load existing settings
  let existingSettings: AdminSettings | null = null;
  try {
    const content = await fs.readFile(settingsPath, 'utf-8');
    existingSettings = JSON.parse(content);
  } catch {
    // No existing settings, use new ones
    await fs.writeFile(settingsPath, JSON.stringify(newSettings, null, 2));
    return newSettings;
  }

  // Create maps for easy lookup
  const existingModelsMap = new Map(
    existingSettings?.models.map((m) => [m.id, m]) || []
  );

  // Process each model
  const mergedModels = newSettings.models.map((newModel) => {
    const existingModel = existingModelsMap.get(newModel.id);
    const fields = processModelFields(newModel, existingModel, newSettings);
    const modelOverrides = mergeModelSettings(newModel, existingModel);

    return {
      ...newModel,
      ...modelOverrides,
      fields: fields.sort((a, b) => a.order - b.order),
    };
  });

  const mergedSettings: AdminSettings = {
    models: mergedModels,
    enums: newSettings.enums,
  };

  // Save merged settings
  await fs.writeFile(
    settingsPath,
    JSON.stringify(mergedSettings, null, 2),
    'utf-8'
  );

  // Clean up temp file
  try {
    await fs.unlink('temp.json');
  } catch {}

  return mergedSettings;
}

// Simplified getDMMF for example - in production use Prisma's
async function getDMMF(_schema: string): Promise<DMMF.Document> {
  // This is a placeholder - in real implementation,
  // you would use Prisma's getDMMF function
  // For now, we'll parse the existing Prisma client
  const { Prisma } = await import('../../prisma-client');

  // @ts-expect-error - accessing internal Prisma DMMF
  return Prisma.dmmf;
}
