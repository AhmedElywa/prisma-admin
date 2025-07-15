'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Trash2, Download, ChevronDown, X, Loader2, FileDown, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { bulkDeleteRecords, exportRecords } from '@/lib/actions/crud'

interface BulkActionsProps {
  selectedCount: number
  selectedIds: (string | number)[]
  modelName: string
  onClearSelection: () => void
}

export function BulkActions({
  selectedCount,
  selectedIds,
  modelName,
  onClearSelection,
}: BulkActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isExporting, setIsExporting] = useState(false)

  const handleBulkDelete = () => {
    if (!confirm(`Are you sure you want to delete ${selectedCount} item${selectedCount > 1 ? 's' : ''}?`)) {
      return
    }

    startTransition(async () => {
      try {
        await bulkDeleteRecords(modelName, selectedIds)
        toast.success(`Successfully deleted ${selectedCount} item${selectedCount > 1 ? 's' : ''}`)
        onClearSelection()
        router.refresh()
      } catch (error) {
        console.error('Bulk delete failed:', error)
        toast.error('Failed to delete selected items')
      }
    })
  }

  const handleExport = async (format: 'csv' | 'json') => {
    setIsExporting(true)
    try {
      const data = await exportRecords(modelName, selectedIds, format)
      
      // Create a blob and download it
      const blob = new Blob([data], {
        type: format === 'csv' ? 'text/csv' : 'application/json'
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${modelName.toLowerCase()}-export-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success(`Exported ${selectedCount} item${selectedCount > 1 ? 's' : ''} as ${format.toUpperCase()}`)
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Failed to export selected items')
    } finally {
      setIsExporting(false)
    }
  }

  const handleCopyIds = () => {
    const idsText = selectedIds.join(', ')
    navigator.clipboard.writeText(idsText).then(() => {
      toast.success('IDs copied to clipboard')
    }).catch(() => {
      toast.error('Failed to copy IDs')
    })
  }

  return (
    <Card className="p-4 bg-muted/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">
            {selectedCount} item{selectedCount > 1 ? 's' : ''} selected
          </span>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" disabled={isExporting}>
                  {isExporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Export
                      <ChevronDown className="ml-1 h-3 w-3" />
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  <FileDown className="mr-2 h-4 w-4" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('json')}>
                  <FileDown className="mr-2 h-4 w-4" />
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleCopyIds}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy IDs
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={onClearSelection}
        >
          <X className="mr-2 h-4 w-4" />
          Clear selection
        </Button>
      </div>
    </Card>
  )
}