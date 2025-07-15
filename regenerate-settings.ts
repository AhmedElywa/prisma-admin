import { mergeAdminSettings } from './src/lib/admin/generator'

async function regenerate() {
  try {
    console.log('Regenerating admin settings with relation defaults...')
    await mergeAdminSettings()
    console.log('✅ Admin settings regenerated successfully!')
    
    // Read and display a sample of the settings to verify
    const fs = await import('fs/promises')
    const settings = JSON.parse(await fs.readFile('./adminSettings.json', 'utf-8'))
    
    // Find a relation field to verify
    const postModel = settings.models.find((m: any) => m.id === 'Post')
    if (postModel) {
      const authorField = postModel.fields.find((f: any) => f.name === 'author')
      const tagsField = postModel.fields.find((f: any) => f.name === 'tags')
      
      console.log('\n📋 Sample relation fields:')
      console.log('\nAuthor field (Many-to-One):')
      console.log('- Display mode:', authorField?.relationDisplayMode)
      console.log('- Actions:', authorField?.relationActions)
      console.log('- Edit mode:', authorField?.relationEditMode)
      
      console.log('\nTags field (Many-to-Many):')
      console.log('- Display mode:', tagsField?.relationDisplayMode)
      console.log('- Actions:', tagsField?.relationActions)
      console.log('- Edit mode:', tagsField?.relationEditMode)
    }
  } catch (error) {
    console.error('❌ Error regenerating settings:', error)
  }
}

regenerate()