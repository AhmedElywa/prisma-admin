'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { importCSVData } from '@/lib/actions/import'
import { toast } from 'sonner'
import { AdminField } from '@/lib/admin/types'

interface CSVImportProps {
  modelName: string
  fields: AdminField[]
  onSuccess?: () => void
  onCancel?: () => void
}

export function CSVImport({ modelName, fields, onSuccess, onCancel }: CSVImportProps) {
  const [file, setFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<any[]>([])
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>({})
  const [skipFirstRow, setSkipFirstRow] = useState(true)
  const [importing, setImporting] = useState(false)
  const [importResults, setImportResults] = useState<{
    success: number
    failed: number
    errors: string[]
  } | null>(null)

  // Get importable fields (exclude relations and computed fields)
  const importableFields = fields.filter(f => 
    f.create && 
    f.kind === 'scalar' && 
    !f.isId && 
    !f.relationField
  )

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Please select a CSV file')
      return
    }

    setFile(selectedFile)
    
    // Read and parse CSV
    const text = await selectedFile.text()
    const lines = text.split('\n').filter(line => line.trim())
    
    if (lines.length === 0) {
      toast.error('CSV file is empty')
      return
    }

    // Parse headers
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
    setCsvHeaders(headers)

    // Parse data rows (preview first 5)
    const dataRows = lines.slice(1, 6).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
      return headers.reduce((obj, header, index) => {
        obj[header] = values[index] || ''
        return obj
      }, {} as Record<string, string>)
    })
    
    setCsvData(dataRows)

    // Auto-map fields based on name similarity
    const mappings: Record<string, string> = {}
    headers.forEach(header => {
      const headerLower = header.toLowerCase().replace(/[^a-z0-9]/g, '')
      const matchedField = importableFields.find(field => {
        const fieldLower = field.name.toLowerCase()
        const titleLower = field.title.toLowerCase().replace(/[^a-z0-9]/g, '')
        return fieldLower === headerLower || titleLower === headerLower
      })
      
      if (matchedField) {
        mappings[header] = matchedField.name
      }
    })
    
    setFieldMappings(mappings)
  }

  const handleImport = async () => {
    if (!file) return

    setImporting(true)
    setImportResults(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('modelName', modelName)
      formData.append('mappings', JSON.stringify(fieldMappings))
      formData.append('skipFirstRow', skipFirstRow.toString())

      const results = await importCSVData(formData)
      
      setImportResults(results)
      
      if (results.success > 0) {
        toast.success(`Successfully imported ${results.success} records`)
        if (onSuccess) {
          setTimeout(onSuccess, 2000)
        }
      }
      
      if (results.failed > 0) {
        toast.error(`Failed to import ${results.failed} records`)
      }
    } catch (error) {
      console.error('Import failed:', error)
      toast.error('Failed to import CSV data')
    } finally {
      setImporting(false)
    }
  }

  const getMappedFieldTitle = (fieldName: string) => {
    const field = importableFields.find(f => f.name === fieldName)
    return field?.title || fieldName
  }

  const isRequiredFieldMapped = (field: AdminField) => {
    return Object.values(fieldMappings).includes(field.name)
  }

  const allRequiredFieldsMapped = importableFields
    .filter(f => f.required)
    .every(f => isRequiredFieldMapped(f))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import {modelName} from CSV</CardTitle>
        <CardDescription>
          Upload a CSV file to bulk import records
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload */}
        <div className="space-y-2">
          <Label htmlFor="csv-file">CSV File</Label>
          <div className="flex items-center gap-4">
            <label
              htmlFor="csv-file"
              className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-muted"
            >
              <Upload className="h-4 w-4" />
              {file ? file.name : 'Choose file'}
            </label>
            <input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>

        {/* Preview and Mapping */}
        {csvHeaders.length > 0 && (
          <>
            {/* Field Mappings */}
            <div className="space-y-4">
              <h3 className="font-medium">Field Mappings</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {csvHeaders.map(header => (
                  <div key={header} className="flex items-center gap-2">
                    <Label className="w-1/3 text-sm">{header}</Label>
                    <Select
                      value={fieldMappings[header] || ''}
                      onValueChange={(value) => {
                        setFieldMappings(prev => ({
                          ...prev,
                          [header]: value
                        }))
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Skip field" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Skip field</SelectItem>
                        {importableFields.map(field => (
                          <SelectItem key={field.name} value={field.name}>
                            {field.title}
                            {field.required && ' *'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>

            {/* Required Fields Check */}
            {!allRequiredFieldsMapped && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Missing required fields: {
                    importableFields
                      .filter(f => f.required && !isRequiredFieldMapped(f))
                      .map(f => f.title)
                      .join(', ')
                  }
                </AlertDescription>
              </Alert>
            )}

            {/* Data Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Data Preview</h3>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="skip-header"
                    checked={skipFirstRow}
                    onCheckedChange={(checked) => setSkipFirstRow(checked as boolean)}
                  />
                  <Label htmlFor="skip-header" className="text-sm">
                    First row contains headers
                  </Label>
                </div>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {csvHeaders.map(header => (
                        <TableHead key={header} className="text-xs">
                          {header}
                          {fieldMappings[header] && (
                            <div className="text-muted-foreground">
                              → {getMappedFieldTitle(fieldMappings[header])}
                            </div>
                          )}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvData.map((row, index) => (
                      <TableRow key={index}>
                        {csvHeaders.map(header => (
                          <TableCell key={header} className="text-sm">
                            {row[header]}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {csvData.length < 5 && (
                <p className="text-sm text-muted-foreground">
                  Showing all {csvData.length} rows
                </p>
              )}
              {csvData.length === 5 && (
                <p className="text-sm text-muted-foreground">
                  Showing first 5 rows of preview
                </p>
              )}
            </div>
          </>
        )}

        {/* Import Results */}
        {importResults && (
          <Alert>
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                {importResults.success > 0 && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{importResults.success} imported</span>
                  </div>
                )}
                {importResults.failed > 0 && (
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircle className="h-4 w-4" />
                    <span>{importResults.failed} failed</span>
                  </div>
                )}
              </div>
              {importResults.errors.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-sm font-medium">Errors:</p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside">
                    {importResults.errors.slice(0, 5).map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                  {importResults.errors.length > 5 && (
                    <p className="text-sm text-muted-foreground">
                      ... and {importResults.errors.length - 5} more errors
                    </p>
                  )}
                </div>
              )}
            </div>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={importing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || !allRequiredFieldsMapped || importing}
          >
            {importing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Import CSV
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}