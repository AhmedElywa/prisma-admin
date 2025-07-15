import { AdminSettings, AdminModel, AdminField } from './types'
import fs from 'fs/promises'
import path from 'path'
import { cache } from 'react'

const SETTINGS_PATH = path.join(process.cwd(), 'adminSettings.json')

// Cache the settings loading to avoid multiple file reads
export const getAdminSettings = cache(async (): Promise<AdminSettings> => {
  try {
    const content = await fs.readFile(SETTINGS_PATH, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    console.error('Failed to load admin settings:', error)
    // Return empty settings as fallback
    return { models: [], enums: [] }
  }
})

export async function getModelSettings(modelName: string): Promise<AdminModel | null> {
  const settings = await getAdminSettings()
  return settings.models.find(m => 
    m.id.toLowerCase() === modelName.toLowerCase()
  ) || null
}

export async function getFieldSettings(
  modelName: string, 
  fieldName: string
): Promise<AdminField | null> {
  const model = await getModelSettings(modelName)
  if (!model) return null
  
  return model.fields.find(f => f.name === fieldName) || null
}

// Get fields for table display
export async function getTableFields(modelName: string): Promise<AdminField[]> {
  const model = await getModelSettings(modelName)
  if (!model) return []
  
  return model.fields
    .filter(f => f.read)
    .sort((a, b) => a.order - b.order)
}

// Get fields for create form
export async function getCreateFields(modelName: string): Promise<AdminField[]> {
  const model = await getModelSettings(modelName)
  if (!model) return []
  
  return model.fields
    .filter(f => f.create)
    .sort((a, b) => a.order - b.order)
}

// Get fields for update form
export async function getUpdateFields(modelName: string): Promise<AdminField[]> {
  const model = await getModelSettings(modelName)
  if (!model) return []
  
  return model.fields
    .filter(f => f.update)
    .sort((a, b) => a.order - b.order)
}

// Get fields that can be filtered
export async function getFilterableFields(modelName: string): Promise<AdminField[]> {
  const model = await getModelSettings(modelName)
  if (!model) return []
  
  return model.fields.filter(f => f.filter)
}

// Get fields that can be sorted
export async function getSortableFields(modelName: string): Promise<AdminField[]> {
  const model = await getModelSettings(modelName)
  if (!model) return []
  
  return model.fields.filter(f => f.sort)
}

// Get enum values
export async function getEnumValues(enumName: string): Promise<string[]> {
  const settings = await getAdminSettings()
  const enumType = settings.enums.find(e => e.name === enumName)
  return enumType?.fields || []
}

// Check model permissions
export async function canCreateModel(modelName: string): Promise<boolean> {
  const model = await getModelSettings(modelName)
  return model?.create || false
}

export async function canUpdateModel(modelName: string): Promise<boolean> {
  const model = await getModelSettings(modelName)
  return model?.update || false
}

export async function canDeleteModel(modelName: string): Promise<boolean> {
  const model = await getModelSettings(modelName)
  return model?.delete || false
}

export async function canReadModel(modelName: string): Promise<boolean> {
  const model = await getModelSettings(modelName)
  return model !== null // If model exists in settings, it's readable
}

// Get display value for a record
export async function getDisplayValue(
  modelName: string,
  record: any
): Promise<string> {
  const model = await getModelSettings(modelName)
  if (!model) return String(record.id || 'Unknown')
  
  // Use display fields
  const values = model.displayFields
    .map(fieldName => {
      const value = record[fieldName]
      return value !== null && value !== undefined ? String(value) : null
    })
    .filter(Boolean)
  
  return values.join(' - ') || String(record[model.idField] || 'Unknown')
}

// Update settings (for Settings UI)
export async function updateAdminSettings(settings: AdminSettings): Promise<void> {
  await fs.writeFile(SETTINGS_PATH, JSON.stringify(settings, null, 2), 'utf-8')
}

// Get all models
export async function getAllModels(): Promise<AdminModel[]> {
  const settings = await getAdminSettings()
  return settings.models
}

// Helper to determine field input type
export async function getFieldInputType(field: AdminField, modelName?: string): Promise<string> {
  // Handle array fields
  if (field.list && field.kind === 'scalar') {
    return 'array'
  }
  
  if (field.kind === 'enum') return 'select'
  if (field.kind === 'object') return 'relation'
  
  // Check if this scalar field is a foreign key
  if (modelName && field.kind === 'scalar' && (field.type === 'Int' || field.type === 'String')) {
    const model = await getModelSettings(modelName)
    if (model) {
      // Check if there's a relation field that uses this field as its foreign key
      const relationField = model.fields.find(f => 
        f.kind === 'object' && f.relationFrom === field.name
      )
      if (relationField) {
        return 'relation'
      }
    }
  }
  
  switch (field.type) {
    case 'String':
      if (field.editor) return 'richtext'
      if (field.upload) return 'file'
      return 'text'
    case 'Int':
    case 'BigInt':
    case 'Float':
    case 'Decimal':
      return 'number'
    case 'Boolean':
      return 'boolean'
    case 'DateTime':
      return 'datetime'
    case 'Json':
      return 'json'
    default:
      return 'text'
  }
}

// Helper to get column type for data table
export function getColumnType(field: AdminField): string {
  if (field.kind === 'object') return 'custom'
  if (field.type === 'DateTime') return 'date'
  if (field.type === 'Boolean') return 'boolean'
  if (field.list) return 'number'
  if (['Int', 'BigInt', 'Float', 'Decimal'].includes(field.type)) return 'number'
  return 'text'
}