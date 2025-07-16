'use server';

import { revalidatePath } from 'next/cache';
import {
  buildPrismaWhere,
  mergeWhereConditions,
} from '@/app/admin/_components/filters/filter-builder';
import type { FilterValue } from '@/app/admin/_components/filters/types';
import {
  canCreateModel,
  canDeleteModel,
  canReadModel,
  canUpdateModel,
  getCreateFields,
  getModelSettings,
  getTableFields,
  getUpdateFields,
} from '@/lib/admin/settings';
import type { AdminField, AdminModel, QueryOptions } from '@/lib/admin/types';
import { getPrismaModel, normalizeModelName } from '@/lib/prisma-client';
import type {
  OrderByInput,
  PrismaFindManyArgs,
  SelectInput,
  WhereInput,
} from '@/lib/prisma-types';

// Build Prisma select object from model settings
async function buildSelect(_modelName: string, fields: AdminField[]) {
  const select: SelectInput = {};

  // Get all related models in parallel
  const objectFields = fields.filter((f) => f.kind === 'object');
  const relatedModels = await Promise.all(
    objectFields.map((field) =>
      getModelSettings(field.type).then((model) => ({ field, model }))
    )
  );

  for (const field of fields) {
    if (field.kind === 'scalar' || field.kind === 'enum') {
      select[field.name] = true;
    } else if (field.kind === 'object') {
      // Find the related model from our preloaded data
      const relatedData = relatedModels.find(
        (rm) => rm.field.name === field.name
      );
      const relatedModel = relatedData?.model;

      if (relatedModel) {
        const relationSelect: SelectInput = {
          [relatedModel.idField]: true,
        };

        // Add display fields
        for (const displayField of relatedModel.displayFields) {
          relationSelect[displayField] = true;
        }

        if (field.list) {
          // For list relations, include the select
          select[field.name] = {
            select: relationSelect,
          };
        } else {
          // For single relations
          select[field.name] = {
            select: relationSelect,
          };
        }
      } else {
        // Fallback if related model not found
        select[field.name] = {
          select: {
            id: true,
          },
        };
      }
    }
  }

  return select;
}

// Build Prisma where clause from filters
function buildWhere(
  filters?: Record<string, any> | FilterValue[]
): WhereInput | undefined {
  if (!filters) {
    return;
  }

  // Handle new filter format (array of FilterValue)
  if (Array.isArray(filters)) {
    return buildPrismaWhere(filters);
  }

  // Handle legacy format (object)
  if (Object.keys(filters).length === 0) {
    return;
  }

  const where: WhereInput = {};

  for (const [key, value] of Object.entries(filters)) {
    if (value === '' || value === null || value === undefined) {
      continue;
    }

    // Handle different filter types
    if (typeof value === 'string') {
      where[key] = { contains: value, mode: 'insensitive' };
    } else {
      where[key] = value;
    }
  }

  return where;
}

// Build Prisma orderBy
function buildOrderBy(
  sortField?: string,
  sortOrder?: 'asc' | 'desc'
): OrderByInput | undefined {
  if (!sortField) {
    return;
  }

  return {
    [sortField]: sortOrder || 'asc',
  };
}

// Get paginated data for any model
export async function getModelData(
  modelName: string,
  options: QueryOptions = {}
) {
  const model = await getModelSettings(modelName);
  if (!model) {
    throw new Error(`Model ${modelName} not found`);
  }

  const fields = await getTableFields(modelName);
  const select = await buildSelect(modelName, fields);

  const {
    page = 1,
    perPage = 10,
    orderBy,
    order = 'asc',
    search,
    filters,
  } = options;

  // Build where clause
  const filterWhere = buildWhere(filters);

  // Build search conditions
  let searchWhere: WhereInput | undefined;
  if (search) {
    const searchConditions = fields
      .filter((f) => f.type === 'String' && !f.list)
      .map((f) => ({
        [f.name]: { contains: search, mode: 'insensitive' },
      }));

    if (searchConditions.length > 0) {
      searchWhere = { OR: searchConditions };
    }
  }

  // Merge filter and search conditions
  const where = mergeWhereConditions(filterWhere, searchWhere);

  // Get model delegate
  const modelDelegate = getPrismaModel(normalizeModelName(modelName));

  // Get total count
  const totalCount = await modelDelegate.count({ where });

  // Build query args
  const queryArgs: PrismaFindManyArgs = {
    where,
    orderBy: buildOrderBy(orderBy, order),
    skip: (page - 1) * perPage,
    take: perPage,
    select,
  };

  // Get data
  const data = await modelDelegate.findMany(queryArgs);

  return {
    data,
    totalCount,
    page,
    perPage,
    totalPages: Math.ceil(totalCount / perPage),
  };
}

// Get single record by ID
export async function getModelRecord(modelName: string, id: string | number) {
  const model = await getModelSettings(modelName);
  if (!model) {
    throw new Error(`Model ${modelName} not found`);
  }

  const fields = await getUpdateFields(modelName);
  const select = await buildSelect(modelName, fields);

  // Convert id to appropriate type
  const idValue =
    model.fields.find((f) => f.name === model.idField)?.type === 'Int'
      ? Number.parseInt(id as string, 10)
      : id;

  const modelDelegate = getPrismaModel(normalizeModelName(modelName));

  const record = await modelDelegate.findUnique({
    where: { [model.idField]: idValue },
    select,
  });

  return record;
}

// Helper function to convert form value based on field type
function convertFormValue(
  value: any,
  fieldType: string,
  field?: AdminField
): any {
  switch (fieldType) {
    case 'Int':
    case 'BigInt':
      return Number.parseInt(value as string, 10);
    case 'Float':
    case 'Decimal':
      return Number.parseFloat(value as string);
    case 'Boolean':
      return value === 'true' || value === 'on';
    case 'DateTime':
      return new Date(value as string);
    case 'Json':
      try {
        return JSON.parse(value as string);
      } catch {
        if (field) {
          throw new Error(`Invalid JSON in ${field.title}`);
        }
        return value;
      }
    case 'String':
      // For file uploads, store the filename/path
      if (field?.upload && value instanceof File) {
        return `uploads/${(value as File).name}`;
      }
      return value;
    default:
      return value;
  }
}

// Helper function to process relation field
function processRelationField(
  field: AdminField,
  formData: FormData,
  model: AdminModel
): any {
  const value = formData.get(field.name);
  if (!value || value === '') {
    return;
  }

  const relatedModel = model.fields.find((f) => f.name === field.relationFrom);
  const idType =
    relatedModel?.type === 'Int' ? Number.parseInt(value as string, 10) : value;

  return { connect: { id: idType } };
}

// Helper function to process many-to-many relation
function processManyToManyRelation(field: AdminField, formData: FormData): any {
  const values = formData.getAll(`${field.name}[]`);
  if (values.length === 0) {
    return;
  }

  return {
    connect: values.map((v) => ({
      id: Number.parseInt(v as string, 10) || v,
    })),
  };
}

// Helper function to process scalar array field
function processScalarArrayField(field: AdminField, formData: FormData): any[] {
  const values: any[] = [];
  let index = 0;

  while (true) {
    const value = formData.get(`${field.name}[${index}]`);
    if (value === null) {
      break;
    }

    const convertedValue = convertFormValue(value, field.type);
    values.push(convertedValue);
    index++;
  }

  if (values.length === 0 && field.required) {
    throw new Error(`${field.title} is required`);
  }

  return values;
}

// Helper to process a single field for create/update
function processField(
  field: AdminField,
  formData: FormData,
  model: AdminModel
): any {
  // Handle relation fields
  if (field.kind === 'object') {
    return processRelationField(field, formData, model);
  }

  // Handle many-to-many relations
  if (field.list && field.relationName) {
    return processManyToManyRelation(field, formData);
  }

  // Handle scalar array fields
  if (field.list && field.kind === 'scalar') {
    const values = processScalarArrayField(field, formData);
    return values.length > 0 || !field.required ? values : undefined;
  }

  // Handle regular scalar fields
  const value = formData.get(field.name);
  if (value === null || value === '') {
    if (field.required) {
      throw new Error(`${field.title} is required`);
    }
    return;
  }

  return convertFormValue(value, field.type, field);
}

// Create a new record
export async function createModelRecord(modelName: string, formData: FormData) {
  const model = await getModelSettings(modelName);
  if (!(model && (await canCreateModel(modelName)))) {
    throw new Error(`Cannot create ${modelName}`);
  }

  const fields = await getCreateFields(modelName);
  const data: Record<string, any> = {};

  // Process form data based on field types
  for (const field of fields) {
    const result = processField(field, formData, model);
    if (result !== undefined) {
      data[field.name] = result;
    }
  }

  const modelDelegate = getPrismaModel(normalizeModelName(modelName));
  await modelDelegate.create({ data });
  revalidatePath(`/admin/${modelName.toLowerCase()}`);
}

// Helper function to process relation field for update
function processRelationFieldUpdate(
  field: AdminField,
  formData: FormData,
  model: AdminModel
): any {
  const value = formData.get(field.name);
  if (value !== null && value !== '') {
    const relatedModel = model.fields.find(
      (f) => f.name === field.relationFrom
    );
    const idType =
      relatedModel?.type === 'Int'
        ? Number.parseInt(value as string, 10)
        : value;
    return { connect: { id: idType } };
  }

  if (!field.required) {
    return { disconnect: true };
  }

  return;
}

// Helper function to process many-to-many relation for update
function processManyToManyRelationUpdate(
  field: AdminField,
  formData: FormData
): any {
  const values: string[] = [];
  let index = 0;

  while (true) {
    const value = formData.get(`${field.name}[${index}]`);
    if (value === null) {
      break;
    }
    values.push(value as string);
    index++;
  }

  if (values.length > 0) {
    return {
      set: values.map((v) => ({
        id: field.type === 'Int' ? Number.parseInt(v, 10) : v,
      })),
    };
  }

  return { set: [] };
}

// Helper to process field for update operation
function processFieldForUpdate(
  field: AdminField,
  formData: FormData,
  model: AdminModel,
  data: Record<string, any>
) {
  // Handle relation fields
  if (field.kind === 'object') {
    const result = processRelationFieldUpdate(field, formData, model);
    if (result) {
      data[field.name] = result;
    }
    return;
  }

  // Handle many-to-many relations
  if (field.list && field.relationName) {
    data[field.name] = processManyToManyRelationUpdate(field, formData);
    return;
  }

  // Handle scalar array fields
  if (field.list && field.kind === 'scalar') {
    const values = processScalarArrayField(field, formData);
    data[field.name] = values;
    return;
  }

  // Handle regular scalar fields
  const value = formData.get(field.name);
  if (value !== null && value !== '') {
    data[field.name] = convertFormValue(value, field.type, field);
  } else if (field.required) {
    throw new Error(`${field.title} is required`);
  }
}

// Update an existing record
export async function updateModelRecord(
  modelName: string,
  id: string | number,
  formData: FormData
) {
  const model = await getModelSettings(modelName);
  if (!(model && (await canUpdateModel(modelName)))) {
    throw new Error(`Cannot update ${modelName}`);
  }

  const fields = await getUpdateFields(modelName);
  const data: Record<string, any> = {};

  // Convert id to appropriate type
  const idValue =
    model.fields.find((f) => f.name === model.idField)?.type === 'Int'
      ? Number.parseInt(id as string, 10)
      : id;

  // Process each field
  for (const field of fields) {
    processFieldForUpdate(field, formData, model, data);
  }

  const modelDelegate = getPrismaModel(normalizeModelName(modelName));
  await modelDelegate.update({
    where: { [model.idField]: idValue },
    data,
  });

  revalidatePath(`/admin/${modelName.toLowerCase()}`);
  revalidatePath(`/admin/${modelName.toLowerCase()}/${id}`);
}

// Delete a record
export async function deleteModelRecord(
  modelName: string,
  id: string | number
) {
  const model = await getModelSettings(modelName);
  if (!(model && (await canDeleteModel(modelName)))) {
    throw new Error(`Cannot delete ${modelName}`);
  }

  // Convert id to appropriate type
  const idValue =
    model.fields.find((f) => f.name === model.idField)?.type === 'Int'
      ? Number.parseInt(id as string, 10)
      : id;

  const modelDelegate = getPrismaModel(normalizeModelName(modelName));
  await modelDelegate.delete({
    where: { [model.idField]: idValue },
  });

  revalidatePath(`/admin/${modelName.toLowerCase()}`);
}

// Delete multiple records
export async function deleteModelRecords(
  modelName: string,
  ids: (string | number)[]
) {
  const model = await getModelSettings(modelName);
  if (!(model && (await canDeleteModel(modelName)))) {
    throw new Error(`Cannot delete ${modelName}`);
  }

  const idField = model.fields.find((f) => f.name === model.idField);
  const convertedIds = ids.map((id) =>
    idField?.type === 'Int' ? Number.parseInt(id as string, 10) : id
  );

  const modelDelegate = getPrismaModel(normalizeModelName(modelName));
  await modelDelegate.deleteMany({
    where: {
      [model.idField]: { in: convertedIds },
    },
  });

  revalidatePath(`/admin/${modelName.toLowerCase()}`);
}

// Alias for deleteModelRecords for consistency
export const bulkDeleteRecords = deleteModelRecords;

// Export records in CSV or JSON format
export async function exportRecords(
  modelName: string,
  ids: (string | number)[],
  format: 'csv' | 'json'
): Promise<string> {
  const model = await getModelSettings(modelName);
  if (!(model && (await canReadModel(modelName)))) {
    throw new Error(`Cannot export ${modelName}`);
  }

  // Get fields to export
  const exportFields = model.fields.filter(
    (f) => f.read && f.kind !== 'object'
  );

  // Convert IDs to appropriate type
  const idField = model.fields.find((f) => f.name === model.idField);
  const convertedIds = ids.map((id) =>
    idField?.type === 'Int' ? Number.parseInt(id as string, 10) : id
  );

  // Fetch records
  const modelDelegate = getPrismaModel(normalizeModelName(modelName));
  const records = await modelDelegate.findMany({
    where: {
      [model.idField]: { in: convertedIds },
    },
    select: exportFields.reduce(
      (acc, field) => {
        acc[field.name] = true;
        return acc;
      },
      {} as Record<string, boolean>
    ),
  });

  if (format === 'json') {
    return JSON.stringify(records, null, 2);
  }

  // CSV format
  if (records.length === 0) {
    return '';
  }

  // Build CSV header
  const headers = exportFields.map((f) => f.title);
  const rows = [headers.join(',')];

  // Build CSV rows
  for (const record of records) {
    const values = exportFields.map((field) => {
      const value = record[field.name];

      // Handle null/undefined
      if (value === null || value === undefined) {
        return '';
      }

      // Handle different types
      let stringValue: string;

      if (field.type === 'DateTime' && value) {
        stringValue = new Date(value).toISOString();
      } else if (field.type === 'Json') {
        stringValue = JSON.stringify(value);
      } else {
        stringValue = String(value);
      }

      // Escape CSV values - applies to all field types including JSON
      if (
        stringValue.includes(',') ||
        stringValue.includes('"') ||
        stringValue.includes('\n')
      ) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }

      return stringValue;
    });

    rows.push(values.join(','));
  }

  return rows.join('\n');
}
