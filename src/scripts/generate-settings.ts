import { mergeAdminSettings } from '../lib/admin/generator'
import path from 'path'

async function main() {
  console.log('Generating admin settings...')
  
  try {
    const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma')
    const settingsPath = path.join(process.cwd(), 'adminSettings.json')
    
    await mergeAdminSettings(schemaPath, settingsPath)
    
    console.log('✅ Admin settings generated successfully!')
  } catch (error) {
    console.error('❌ Failed to generate admin settings:', error)
    process.exit(1)
  }
}

main()