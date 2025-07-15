'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { PlusCircle, FileSpreadsheet, Download } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { CSVImport } from './csv-import'
import { exportToCSV } from '@/lib/actions/import'
import { AdminField } from '@/lib/admin/types'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface ModelHeaderActionsProps {
  modelName: string
  modelPath: string
  canCreate: boolean
  fields: AdminField[]
}

export function ModelHeaderActions({ 
  modelName, 
  modelPath, 
  canCreate,
  fields 
}: ModelHeaderActionsProps) {
  const [showImport, setShowImport] = useState(false)
  const [exporting, setExporting] = useState(false)
  const router = useRouter()

  const handleExport = async () => {
    setExporting(true)
    try {
      const csv = await exportToCSV(modelName)
      
      // Create blob and download
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${modelName.toLowerCase()}-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      toast.success('Data exported successfully')
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Failed to export data')
    } finally {
      setExporting(false)
    }
  }

  const handleImportSuccess = () => {
    setShowImport(false)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      {/* Export Button */}
      <Button
        variant="outline"
        onClick={handleExport}
        disabled={exporting}
      >
        <Download className="mr-2 h-4 w-4" />
        Export CSV
      </Button>

      {/* Import Button */}
      {canCreate && (
        <Button
          variant="outline"
          onClick={() => setShowImport(true)}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Import CSV
        </Button>
      )}

      {/* Add Button */}
      {canCreate && (
        <Link href={`/admin/${modelPath}/new`}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add {modelName}
          </Button>
        </Link>
      )}

      {/* Import Dialog */}
      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <CSVImport
            modelName={modelName}
            fields={fields}
            onSuccess={handleImportSuccess}
            onCancel={() => setShowImport(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}