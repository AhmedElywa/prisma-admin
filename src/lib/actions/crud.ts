'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { 
  getModelSettings, 
  getTableFields, 
  getCreateFields, 
  getUpdateFields,
  getFieldInputType,
  getDisplayValue,
  canCreateModel,
  canUpdateModel,
  canDeleteModel,
  canReadModel
} from '@/lib/admin/settings'
import { QueryOptions, AdminField } from '@/lib/admin/types'
import { buildPrismaWhere, mergeWhereConditions } from '@/app/admin/_components/filters/filter-builder'
import { FilterValue } from '@/app/admin/_components/filters/types'
import { WhereInput, SelectInput, OrderByInput, PrismaFindManyArgs } from '@/lib/prisma-types'
import { getPrismaModel, normalizeModelName } from '@/lib/prisma-client'

// Build Prisma select object from model settings
async function buildSelect(modelName: string, fields: AdminField[]) {
  const select: SelectInput = {}
  
  for (const field of fields) {
    if (field.kind === 'scalar' || field.kind === 'enum') {
      select[field.name] = true
    } else if (field.kind === 'object') {
      // Include display fields for relations
      const relatedModel = await getModelSettings(field.type)
      if (relatedModel) {
        const relationSelect: SelectInput = {
          [relatedModel.idField]: true
        }
        
        // Add display fields
        for (const displayField of relatedModel.displayFields) {
          relationSelect[displayField] = true
        }
        
        if (field.list) {
          // For list relations, include the select
          select[field.name] = {
            select: relationSelect
          }
        } else {
          // For single relations
          select[field.name] = {
            select: relationSelect
          }
        }
      } else {
        // Fallback if related model not found
        select[field.name] = {
          select: {
            id: true
          }
        }
      }
    }
  }
  
  return select
}

// Build Prisma where clause from filters
function buildWhere(filters?: Record<string, any> | FilterValue[]): WhereInput | undefined {
  if (!filters) {
    return undefined
  }
  
  // Handle new filter format (array of FilterValue)
  if (Array.isArray(filters)) {
    return buildPrismaWhere(filters)
  }
  
  // Handle legacy format (object)
  if (Object.keys(filters).length === 0) {
    return undefined
  }
  
  const where: WhereInput = {}
  
  for (const [key, value] of Object.entries(filters)) {
    if (value === '' || value === null || value === undefined) {
      continue
    }
    
    // Handle different filter types
    if (typeof value === 'string') {
      where[key] = { contains: value, mode: 'insensitive' }
    } else {
      where[key] = value
    }
  }
  
  return where
}

// Build Prisma orderBy
function buildOrderBy(sortField?: string, sortOrder?: 'asc' | 'desc'): OrderByInput | undefined {
  if (!sortField) return undefined
  
  return {
    [sortField]: sortOrder || 'asc'
  }
}

// Get paginated data for any model
export async function getModelData(
  modelName: string,
  options: QueryOptions = {}
) {
  const model = await getModelSettings(modelName)
  if (!model) {
    throw new Error(`Model ${modelName} not found`)
  }
  
  const fields = await getTableFields(modelName)
  const select = await buildSelect(modelName, fields)
  
  const {
    page = 1,
    perPage = 10,
    orderBy,
    order = 'asc',
    search,
    filters
  } = options
  
  // Build where clause
  const filterWhere = buildWhere(filters)
  
  // Build search conditions
  let searchWhere: WhereInput | undefined = undefined
  if (search) {
    const searchConditions = fields
      .filter(f => f.type === 'String' && !f.list)
      .map(f => ({
        [f.name]: { contains: search, mode: 'insensitive' }
      }))
    
    if (searchConditions.length > 0) {
      searchWhere = { OR: searchConditions }
    }
  }
  
  // Merge filter and search conditions
  const where = mergeWhereConditions(filterWhere, searchWhere)
  
  // Get model delegate
  const modelDelegate = getPrismaModel(normalizeModelName(modelName))
  
  // Get total count
  const totalCount = await modelDelegate.count({ where })
  
  // Build query args
  const queryArgs: PrismaFindManyArgs = {
    where,
    orderBy: buildOrderBy(orderBy, order),
    skip: (page - 1) * perPage,
    take: perPage,
    select
  }
  
  // Get data
  const data = await modelDelegate.findMany(queryArgs)
  
  return {
    data,
    totalCount,
    page,
    perPage,
    totalPages: Math.ceil(totalCount / perPage)
  }
}

// Get single record by ID
export async function getModelRecord(
  modelName: string,
  id: string | number
) {
  const model = await getModelSettings(modelName)
  if (!model) {
    throw new Error(`Model ${modelName} not found`)
  }
  
  const fields = await getUpdateFields(modelName)
  const select = await buildSelect(modelName, fields)
  
  // Convert id to appropriate type
  const idValue = model.fields.find(f => f.name === model.idField)?.type === 'Int' 
    ? parseInt(id as string) 
    : id
  
  const modelDelegate = getPrismaModel(normalizeModelName(modelName))
  
  const record = await modelDelegate.findUnique({
    where: { [model.idField]: idValue },
    select
  })
  
  return record
}

// Create a new record
export async function createModelRecord(
  modelName: string,
  formData: FormData
) {
  const model = await getModelSettings(modelName)
  if (!model || !await canCreateModel(modelName)) {
    throw new Error(`Cannot create ${modelName}`)
  }
  
  const fields = await getCreateFields(modelName)
  const data: Record<string, any> = {}
  
  // Process form data based on field types
  for (const field of fields) {
    // Handle relation fields
    if (field.kind === 'object') {
      const value = formData.get(field.name)
      if (value && value !== '') {
        // For relations, use connect syntax
        const relatedModel = model.fields.find(f => f.name === field.relationFrom)
        const idType = relatedModel?.type === 'Int' ? parseInt(value as string) : value
        data[field.name] = {
          connect: { id: idType }
        }
      }
      continue
    }
    
    // Handle many-to-many relations
    if (field.list && field.relationName) {
      const values = formData.getAll(`${field.name}[]`)
      if (values.length > 0) {
        data[field.name] = {
          connect: values.map(v => ({ id: parseInt(v as string) || v }))
        }
      }
      continue
    }
    
    // Handle scalar array fields
    if (field.list && field.kind === 'scalar') {
      const values: any[] = []
      let index = 0
      while (true) {
        const value = formData.get(`${field.name}[${index}]`)
        if (value === null) break
        
        // Convert value based on field type
        let convertedValue: any = value
        switch (field.type) {
          case 'Int':
          case 'BigInt':
            convertedValue = parseInt(value as string)
            break
          case 'Float':
          case 'Decimal':
            convertedValue = parseFloat(value as string)
            break
          case 'Boolean':
            convertedValue = value === 'true'
            break
          case 'DateTime':
            convertedValue = new Date(value as string)
            break
          case 'Json':
            try {
              convertedValue = JSON.parse(value as string)
            } catch {
              convertedValue = value
            }
            break
        }
        
        values.push(convertedValue)
        index++
      }
      
      if (values.length > 0 || !field.required) {
        data[field.name] = values
      } else if (field.required) {
        throw new Error(`${field.title} is required`)
      }
      continue
    }
    
    const value = formData.get(field.name)
    
    if (value === null || value === '') {
      if (field.required) {
        throw new Error(`${field.title} is required`)
      }
      continue
    }
    
    // Convert value based on field type
    switch (field.type) {
      case 'Int':
      case 'BigInt':
        data[field.name] = parseInt(value as string)
        break
      case 'Float':
      case 'Decimal':
        data[field.name] = parseFloat(value as string)
        break
      case 'Boolean':
        data[field.name] = value === 'true' || value === 'on'
        break
      case 'DateTime':
        data[field.name] = new Date(value as string)
        break
      case 'Json':
        try {
          data[field.name] = JSON.parse(value as string)
        } catch {
          throw new Error(`Invalid JSON in ${field.title}`)
        }
        break
      case 'String':
        // For file uploads, we would need to handle the file separately
        // For now, we'll just store the filename or path as a string
        // In a real implementation, you'd upload to S3/Cloudinary/etc.
        if (field.upload && value instanceof File) {
          // This is a placeholder - in production, upload the file
          // and store the URL/path
          data[field.name] = `uploads/${(value as File).name}`
        } else {
          data[field.name] = value
        }
        break
      default:
        data[field.name] = value
    }
  }
  
  const modelDelegate = getPrismaModel(normalizeModelName(modelName))
  await modelDelegate.create({ data })
  revalidatePath(`/admin/${modelName.toLowerCase()}`)
}

// Update an existing record
export async function updateModelRecord(
  modelName: string,
  id: string | number,
  formData: FormData
) {
  const model = await getModelSettings(modelName)
  if (!model || !await canUpdateModel(modelName)) {
    throw new Error(`Cannot update ${modelName}`)
  }
  
  const fields = await getUpdateFields(modelName)
  const data: Record<string, any> = {}
  
  // Convert id to appropriate type
  const idValue = model.fields.find(f => f.name === model.idField)?.type === 'Int' 
    ? parseInt(id as string) 
    : id
  
  // Process form data
  for (const field of fields) {
    // Handle relation fields
    if (field.kind === 'object') {
      const value = formData.get(field.name)
      if (value !== null && value !== '') {
        // For relations, use connect syntax
        const relatedModel = model.fields.find(f => f.name === field.relationFrom)
        const idType = relatedModel?.type === 'Int' ? parseInt(value as string) : value
        data[field.name] = {
          connect: { id: idType }
        }
      } else if (!field.required) {
        // Disconnect if empty and not required
        data[field.name] = {
          disconnect: true
        }
      }
      continue
    }
    
    // Handle many-to-many relations
    if (field.list && field.relationName) {
      // RelationConnect component sends data as field[0], field[1], etc.
      const values: string[] = []
      let index = 0
      while (true) {
        const value = formData.get(`${field.name}[${index}]`)
        if (value === null) break
        values.push(value as string)
        index++
      }
      
      if (values.length > 0) {
        // Use set to replace all connections
        data[field.name] = {
          set: values.map(v => ({ 
            id: field.type === 'Int' ? parseInt(v) : v 
          }))
        }
      } else {
        // Disconnect all if none selected
        data[field.name] = {
          set: []
        }
      }
      continue
    }
    
    // Handle scalar array fields
    if (field.list && field.kind === 'scalar') {
      const values: any[] = []
      let index = 0
      while (true) {
        const value = formData.get(`${field.name}[${index}]`)
        if (value === null) break
        
        // Convert value based on field type
        let convertedValue: any = value
        switch (field.type) {
          case 'Int':
          case 'BigInt':
            convertedValue = parseInt(value as string)
            break
          case 'Float':
          case 'Decimal':
            convertedValue = parseFloat(value as string)
            break
          case 'Boolean':
            convertedValue = value === 'true'
            break
          case 'DateTime':
            convertedValue = new Date(value as string)
            break
          case 'Json':
            try {
              convertedValue = JSON.parse(value as string)
            } catch {
              convertedValue = value
            }
            break
        }
        
        values.push(convertedValue)
        index++
      }
      
      data[field.name] = values
      continue
    }
    
    const value = formData.get(field.name)
    
    if (value === null || value === '') {
      if (field.required) {
        throw new Error(`${field.title} is required`)
      }
      continue
    }
    
    // Convert value based on field type
    switch (field.type) {
      case 'Int':
      case 'BigInt':
        data[field.name] = parseInt(value as string)
        break
      case 'Float':
      case 'Decimal':
        data[field.name] = parseFloat(value as string)
        break
      case 'Boolean':
        data[field.name] = value === 'true' || value === 'on'
        break
      case 'DateTime':
        data[field.name] = new Date(value as string)
        break
      case 'Json':
        try {
          data[field.name] = JSON.parse(value as string)
        } catch {
          throw new Error(`Invalid JSON in ${field.title}`)
        }
        break
      case 'String':
        // For file uploads, we would need to handle the file separately
        // For now, we'll just store the filename or path as a string
        // In a real implementation, you'd upload to S3/Cloudinary/etc.
        if (field.upload && value instanceof File) {
          // This is a placeholder - in production, upload the file
          // and store the URL/path
          data[field.name] = `uploads/${(value as File).name}`
        } else {
          data[field.name] = value
        }
        break
      default:
        data[field.name] = value
    }
  }
  
  const modelDelegate = getPrismaModel(normalizeModelName(modelName))
  await modelDelegate.update({
    where: { [model.idField]: idValue },
    data
  })
  
  revalidatePath(`/admin/${modelName.toLowerCase()}`)
  revalidatePath(`/admin/${modelName.toLowerCase()}/${id}`)
}

// Delete a record
export async function deleteModelRecord(
  modelName: string,
  id: string | number
) {
  const model = await getModelSettings(modelName)
  if (!model || !await canDeleteModel(modelName)) {
    throw new Error(`Cannot delete ${modelName}`)
  }
  
  // Convert id to appropriate type
  const idValue = model.fields.find(f => f.name === model.idField)?.type === 'Int' 
    ? parseInt(id as string) 
    : id
  
  const modelDelegate = getPrismaModel(normalizeModelName(modelName))
  await modelDelegate.delete({
    where: { [model.idField]: idValue }
  })
  
  revalidatePath(`/admin/${modelName.toLowerCase()}`)
}

// Delete multiple records
export async function deleteModelRecords(
  modelName: string,
  ids: (string | number)[]
) {
  const model = await getModelSettings(modelName)
  if (!model || !await canDeleteModel(modelName)) {
    throw new Error(`Cannot delete ${modelName}`)
  }
  
  const idField = model.fields.find(f => f.name === model.idField)
  const convertedIds = ids.map(id => 
    idField?.type === 'Int' ? parseInt(id as string) : id
  )
  
  const modelDelegate = getPrismaModel(normalizeModelName(modelName))
  await modelDelegate.deleteMany({
    where: {
      [model.idField]: { in: convertedIds }
    }
  })
  
  revalidatePath(`/admin/${modelName.toLowerCase()}`)
}

// Alias for deleteModelRecords for consistency
export const bulkDeleteRecords = deleteModelRecords

// Export records in CSV or JSON format
export async function exportRecords(
  modelName: string,
  ids: (string | number)[],
  format: 'csv' | 'json'
): Promise<string> {
  const model = await getModelSettings(modelName)
  if (!model || !await canReadModel(modelName)) {
    throw new Error(`Cannot export ${modelName}`)
  }
  
  // Get fields to export
  const exportFields = model.fields.filter(f => f.read && f.kind !== 'object')
  
  // Convert IDs to appropriate type
  const idField = model.fields.find(f => f.name === model.idField)
  const convertedIds = ids.map(id => 
    idField?.type === 'Int' ? parseInt(id as string) : id
  )
  
  // Fetch records
  const modelDelegate = getPrismaModel(normalizeModelName(modelName))
  const records = await modelDelegate.findMany({
    where: {
      [model.idField]: { in: convertedIds }
    },
    select: exportFields.reduce((acc, field) => {
      acc[field.name] = true
      return acc
    }, {} as Record<string, boolean>)
  })
  
  if (format === 'json') {
    return JSON.stringify(records, null, 2)
  }
  
  // CSV format
  if (records.length === 0) {
    return ''
  }
  
  // Build CSV header
  const headers = exportFields.map(f => f.title)
  const rows = [headers.join(',')]
  
  // Build CSV rows
  for (const record of records) {
    const values = exportFields.map(field => {
      const value = record[field.name]
      
      // Handle null/undefined
      if (value === null || value === undefined) {
        return ''
      }
      
      // Handle different types
      let stringValue: string
      
      if (field.type === 'DateTime' && value) {
        stringValue = new Date(value).toISOString()
      } else if (field.type === 'Json') {
        stringValue = JSON.stringify(value)
      } else {
        stringValue = String(value)
      }
      
      // Escape CSV values - applies to all field types including JSON
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      
      return stringValue
    })
    
    rows.push(values.join(','))
  }
  
  return rows.join('\n')
}