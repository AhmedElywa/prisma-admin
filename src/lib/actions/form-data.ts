'use server'

import { getCreateFields, getFieldInputType, getEnumValues, getModelSettings, getDisplayValue } from '@/lib/admin/settings'
import { AdminField, AdminModel } from '@/lib/admin/types'

export interface FormFieldData extends AdminField {
  inputType: string
  options?: string[]
  relatedModel?: string
}

export async function getFormFieldsData(modelName: string): Promise<FormFieldData[]> {
  const createFields = await getCreateFields(modelName)
  const modelSettings = await getModelSettings(modelName)
  
  const formFields = await Promise.all(
    createFields.map(async (field) => {
      const inputType = await getFieldInputType(field, modelName)
      let options: string[] | undefined
      
      if (field.kind === 'enum') {
        options = await getEnumValues(field.type)
      }
      
      return {
        ...field,
        inputType,
        options,
        relatedModel: field.kind === 'object' ? field.type : 
          // For foreign key fields, find the related model from the relation field
          modelSettings?.fields.find(f => f.relationFrom === field.name)?.type
      }
    })
  )
  
  return formFields
}

// Server action to get model settings
export async function getModelSettingsData(modelName: string): Promise<AdminModel | null> {
  return await getModelSettings(modelName)
}

// Server action to get display value for a record
export async function getRecordDisplayValue(
  modelName: string,
  record: any
): Promise<string> {
  return await getDisplayValue(modelName, record)
}