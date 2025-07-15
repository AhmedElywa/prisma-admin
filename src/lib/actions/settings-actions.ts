'use server'

import { 
  getModelSettings as getModelSettingsInternal,
  getDisplayValue as getDisplayValueInternal,
  getAllModels as getAllModelsInternal
} from '@/lib/admin/settings'

// Server action to get model settings that can be called from client components
export async function getModelSettingsAction(modelName: string) {
  return await getModelSettingsInternal(modelName)
}

// Server action to get display value
export async function getDisplayValueAction(modelName: string, record: any) {
  return await getDisplayValueInternal(modelName, record)
}

// Server action to get all models
export async function getAllModelsAction() {
  return await getAllModelsInternal()
}