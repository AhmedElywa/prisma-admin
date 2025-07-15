'use server'

import { AdminModel, AdminSettings } from '@/lib/admin/types'
import { updateAdminSettings } from '@/lib/admin/settings'
import { mergeAdminSettings } from '@/lib/admin/generator'
import { revalidatePath } from 'next/cache'
import path from 'path'

export async function saveModelSettings(models: AdminModel[]): Promise<{ success: boolean }> {
  try {
    // Read settings directly from file to bypass cache
    const fs = await import('fs/promises')
    const settingsPath = path.join(process.cwd(), 'adminSettings.json')
    const content = await fs.readFile(settingsPath, 'utf-8')
    const currentSettings = JSON.parse(content) as AdminSettings
    
    // Create a map of updated models by ID for efficient lookup
    const updatedModelsMap = new Map(models.map(m => [m.id, m]))
    
    // Update only the models that were changed
    const mergedModels = currentSettings.models.map(existingModel => {
      const updatedModel = updatedModelsMap.get(existingModel.id)
      return updatedModel || existingModel
    })
    
    // Create the updated settings
    const updatedSettings: AdminSettings = {
      ...currentSettings,
      models: mergedModels
    }
    
    // Save to file
    await updateAdminSettings(updatedSettings)
    
    // Revalidate all admin pages
    revalidatePath('/admin', 'layout')
    
    return { success: true }
  } catch (error) {
    console.error('Failed to save settings:', error)
    throw new Error('Failed to save settings')
  }
}

export async function regenerateSettings(): Promise<void> {
  try {
    const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma')
    const settingsPath = path.join(process.cwd(), 'adminSettings.json')
    
    // Regenerate and merge with existing settings
    await mergeAdminSettings(schemaPath, settingsPath)
    
    // Revalidate all admin pages
    revalidatePath('/admin', 'layout')
  } catch (error) {
    console.error('Failed to regenerate settings:', error)
    throw new Error('Failed to regenerate settings')
  }
}

export async function resetFieldSettings(modelId: string): Promise<{ success: boolean }> {
  try {
    // Read settings directly from file to bypass cache
    const fs = await import('fs/promises')
    const settingsPath = path.join(process.cwd(), 'adminSettings.json')
    const content = await fs.readFile(settingsPath, 'utf-8')
    const currentSettings = JSON.parse(content) as AdminSettings
    
    // Find the model
    const modelIndex = currentSettings.models.findIndex(m => m.id === modelId)
    if (modelIndex === -1) {
      throw new Error('Model not found')
    }
    
    // Reset field permissions to defaults
    const model = currentSettings.models[modelIndex]
    
    // Collect foreign key field names
    const foreignKeyFields = new Set<string>()
    model.fields.forEach(field => {
      if (field.relationFrom) {
        foreignKeyFields.add(field.relationFrom)
      }
    })
    
    const updatedModels = [...currentSettings.models]
    updatedModels[modelIndex] = {
      ...updatedModels[modelIndex],
      fields: updatedModels[modelIndex].fields.map(field => ({
        ...field,
        read: !foreignKeyFields.has(field.name), // Hide foreign key fields
        create: !['id', 'createdAt', 'updatedAt'].includes(field.name) && !field.relationField,
        update: !['id', 'createdAt', 'updatedAt'].includes(field.name) && !field.relationField,
        filter: true,
        sort: !field.list && !field.relationField,
        editor: false,
        upload: false,
      }))
    }
    
    const updatedSettings: AdminSettings = {
      ...currentSettings,
      models: updatedModels
    }
    
    await updateAdminSettings(updatedSettings)
    
    revalidatePath('/admin/settings')
    
    return { success: true }
  } catch (error) {
    console.error('Failed to reset field settings:', error)
    throw new Error('Failed to reset field settings')
  }
}