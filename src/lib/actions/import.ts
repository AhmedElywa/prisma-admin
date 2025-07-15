'use server'

import { getModelSettings, canCreateModel } from '@/lib/admin/settings'
import { getPrismaModel, normalizeModelName } from '@/lib/prisma-client'
import { AdminField } from '@/lib/admin/types'

export async function importCSVData(formData: FormData) {
  const file = formData.get('file') as File
  const modelName = formData.get('modelName') as string
  const mappings = JSON.parse(formData.get('mappings') as string) as Record<string, string>
  const skipFirstRow = formData.get('skipFirstRow') === 'true'

  // Check permissions
  if (!await canCreateModel(modelName)) {
    throw new Error(`Not allowed to create ${modelName} records`)
  }

  // Get model settings
  const model = await getModelSettings(modelName)
  if (!model) {
    throw new Error(`Model ${modelName} not found`)
  }

  // Parse CSV
  const text = await file.text()
  const lines = text.split('\n').filter(line => line.trim())
  
  if (lines.length === 0) {
    throw new Error('CSV file is empty')
  }

  // Parse headers
  const headers = parseCSVLine(lines[0])
  
  // Determine start index based on skipFirstRow
  const startIndex = skipFirstRow ? 1 : 0
  
  // Process data rows
  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[]
  }

  const modelDelegate = getPrismaModel(normalizeModelName(modelName))

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    try {
      const values = parseCSVLine(line)
      const record: Record<string, any> = {}

      // Map CSV values to model fields
      headers.forEach((header, index) => {
        const fieldName = mappings[header]
        if (!fieldName) return

        const field = model.fields.find(f => f.name === fieldName)
        if (!field) return

        const value = values[index]
        if (!value && field.required) {
          throw new Error(`Missing required field: ${field.title}`)
        }

        // Convert value based on field type
        record[fieldName] = convertValue(value, field)
      })

      // Check required fields
      const requiredFields = model.fields.filter(f => f.required && f.create && !f.isId)
      for (const field of requiredFields) {
        if (!(field.name in record) || record[field.name] === null) {
          throw new Error(`Missing required field: ${field.title}`)
        }
      }

      // Create record
      await modelDelegate.create({ data: record })
      results.success++
    } catch (error) {
      results.failed++
      results.errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      
      // Stop after too many errors
      if (results.errors.length >= 100) {
        results.errors.push('Too many errors, import stopped')
        break
      }
    }
  }

  return results
}

// Parse a CSV line handling quoted values
function parseCSVLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"'
        i++ // Skip next quote
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      // End of value
      values.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  // Add last value
  values.push(current.trim())
  
  return values
}

// Convert a string value to the appropriate type
function convertValue(value: string, field: AdminField): any {
  if (!value || value === '') {
    return field.required ? null : undefined
  }

  switch (field.type) {
    case 'Int':
    case 'BigInt':
      const intVal = parseInt(value)
      if (isNaN(intVal)) {
        throw new Error(`Invalid integer value for ${field.title}: ${value}`)
      }
      return intVal

    case 'Float':
    case 'Decimal':
      const floatVal = parseFloat(value)
      if (isNaN(floatVal)) {
        throw new Error(`Invalid number value for ${field.title}: ${value}`)
      }
      return floatVal

    case 'Boolean':
      const lowerVal = value.toLowerCase()
      if (['true', '1', 'yes', 'y'].includes(lowerVal)) {
        return true
      } else if (['false', '0', 'no', 'n'].includes(lowerVal)) {
        return false
      } else {
        throw new Error(`Invalid boolean value for ${field.title}: ${value}`)
      }

    case 'DateTime':
      const date = new Date(value)
      if (isNaN(date.getTime())) {
        throw new Error(`Invalid date value for ${field.title}: ${value}`)
      }
      return date

    case 'Json':
      try {
        return JSON.parse(value)
      } catch {
        throw new Error(`Invalid JSON value for ${field.title}: ${value}`)
      }

    case 'String':
    default:
      return value
  }
}

// Export data to CSV
export async function exportToCSV(
  modelName: string,
  ids?: (string | number)[]
): Promise<string> {
  const model = await getModelSettings(modelName)
  if (!model) {
    throw new Error(`Model ${modelName} not found`)
  }

  const modelDelegate = getPrismaModel(normalizeModelName(modelName))
  
  // Get fields to export
  const exportFields = model.fields.filter(f => 
    f.read && 
    f.kind === 'scalar' && 
    !f.relationField
  )

  // Build query
  const query: any = {}
  if (ids && ids.length > 0) {
    const idField = model.fields.find(f => f.isId)
    if (idField) {
      query.where = {
        [idField.name]: { in: ids }
      }
    }
  }

  // Get records
  const records = await modelDelegate.findMany(query)

  // Build CSV
  const headers = exportFields.map(f => escapeCSVValue(f.title))
  const rows = [headers.join(',')]

  for (const record of records) {
    const values = exportFields.map(field => {
      const value = record[field.name]
      return escapeCSVValue(formatValue(value, field))
    })
    rows.push(values.join(','))
  }

  return rows.join('\n')
}

// Escape a value for CSV
function escapeCSVValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

// Format a value for CSV export
function formatValue(value: any, field: AdminField): string {
  if (value === null || value === undefined) {
    return ''
  }

  switch (field.type) {
    case 'DateTime':
      return new Date(value).toISOString()
    
    case 'Json':
      return JSON.stringify(value)
    
    case 'Boolean':
      return value ? 'true' : 'false'
    
    default:
      return String(value)
  }
}