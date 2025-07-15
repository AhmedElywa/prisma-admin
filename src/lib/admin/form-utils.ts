import { AdminField } from './types'

export interface FieldGroup {
  title?: string
  description?: string
  fields: AdminField[]
}

/**
 * Group fields intelligently for form display
 */
export function groupFormFields(fields: AdminField[]): FieldGroup[] {
  const groups: FieldGroup[] = []
  
  // System fields (timestamps, etc)
  const systemFields = fields.filter(f => 
    ['createdAt', 'updatedAt', 'deletedAt'].includes(f.name)
  )
  
  // Relation fields
  const relationFields = fields.filter(f => f.kind === 'object')
  
  // JSON/Complex fields
  const jsonFields = fields.filter(f => f.type === 'Json')
  
  // Regular fields
  const regularFields = fields.filter(f => 
    !systemFields.includes(f) && 
    !relationFields.includes(f) && 
    !jsonFields.includes(f)
  )
  
  // Main group with regular fields
  if (regularFields.length > 0) {
    groups.push({
      title: 'Basic Information',
      description: 'Fill in the required information',
      fields: regularFields
    })
  }
  
  // Relations group
  if (relationFields.length > 0) {
    groups.push({
      title: 'Relationships',
      description: 'Connect to related records',
      fields: relationFields
    })
  }
  
  // JSON/Data fields
  if (jsonFields.length > 0) {
    groups.push({
      title: 'Additional Data',
      description: 'Structured data fields',
      fields: jsonFields
    })
  }
  
  // System fields (usually read-only)
  if (systemFields.length > 0) {
    groups.push({
      title: 'System Information',
      description: 'Automatically managed fields',
      fields: systemFields
    })
  }
  
  return groups
}

/**
 * Check if a field should be disabled in edit mode
 */
export function isFieldDisabled(field: AdminField, isEdit: boolean): boolean {
  // ID fields are always disabled in edit mode
  if (field.isId && isEdit) return true
  
  // System fields are usually disabled
  if (['createdAt', 'updatedAt'].includes(field.name)) return true
  
  // Check field permissions
  if (isEdit && !field.update) return true
  if (!isEdit && !field.create) return true
  
  return false
}

/**
 * Get field validation rules
 */
export function getFieldValidation(field: AdminField) {
  const rules: any = {}
  
  if (field.required) {
    rules.required = `${field.title} is required`
  }
  
  switch (field.type) {
    case 'String':
      if (field.name.includes('email')) {
        rules.pattern = {
          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
          message: 'Invalid email address'
        }
      }
      if (field.name.includes('url')) {
        rules.pattern = {
          value: /^https?:\/\/.+/,
          message: 'Invalid URL'
        }
      }
      break
      
    case 'Int':
    case 'BigInt':
      rules.pattern = {
        value: /^-?\d+$/,
        message: 'Must be a whole number'
      }
      break
      
    case 'Float':
    case 'Decimal':
      rules.pattern = {
        value: /^-?\d*\.?\d+$/,
        message: 'Must be a valid number'
      }
      break
  }
  
  return rules
}