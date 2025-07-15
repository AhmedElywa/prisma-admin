'use server'

import { getFilterableFields, getAdminSettings } from '@/lib/admin/settings'
import { FilterConfig } from '@/app/admin/_components/filters/types'

export async function getRelationFilterFields(modelName: string): Promise<FilterConfig[]> {
  const settings = await getAdminSettings()
  const relFields = await getFilterableFields(modelName)
  
  return relFields.map(field => ({
    field: field.name,
    label: field.title,
    type: field.type,
    kind: field.kind,
    list: field.list,
    relationTo: field.relationFrom,
    enumValues: field.kind === 'enum' 
      ? settings.enums.find(e => e.name === field.type)?.fields
      : undefined
  }))
}