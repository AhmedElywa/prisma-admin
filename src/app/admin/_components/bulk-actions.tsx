'use client';

import {
  ChevronDown,
  Copy,
  Download,
  FileDown,
  Loader2,
  Trash2,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { bulkDeleteRecords, exportRecords } from '@/lib/actions/crud';

interface BulkActionsProps {
  selectedCount: number;
  selectedIds: (string | number)[];
  modelName: string;
  onClearSelection: () => void;
}

export function BulkActions({
  selectedCount,
  selectedIds,
  modelName,
  onClearSelection,
}: BulkActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isExporting, setIsExporting] = useState(false);

  const handleBulkDelete = () => {
    if (
      !confirm(
        `Are you sure you want to delete ${selectedCount} item${selectedCount > 1 ? 's' : ''}?`
      )
    ) {
      return;
    }

    startTransition(async () => {
      try {
        await bulkDeleteRecords(modelName, selectedIds);
        toast.success(
          `Successfully deleted ${selectedCount} item${selectedCount > 1 ? 's' : ''}`
        );
        onClearSelection();
        router.refresh();
      } catch (_error) {
        toast.error('Failed to delete selected items');
      }
    });
  };

  const handleExport = async (format: 'csv' | 'json') => {
    setIsExporting(true);
    try {
      const data = await exportRecords(modelName, selectedIds, format);

      // Create a blob and download it
      const blob = new Blob([data], {
        type: format === 'csv' ? 'text/csv' : 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${modelName.toLowerCase()}-export-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(
        `Exported ${selectedCount} item${selectedCount > 1 ? 's' : ''} as ${format.toUpperCase()}`
      );
    } catch (_error) {
      toast.error('Failed to export selected items');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyIds = () => {
    const idsText = selectedIds.join(', ');
    navigator.clipboard
      .writeText(idsText)
      .then(() => {
        toast.success('IDs copied to clipboard');
      })
      .catch(() => {
        toast.error('Failed to copy IDs');
      });
  };

  return (
    <Card className="bg-muted/50 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-medium text-sm">
            {selectedCount} item{selectedCount > 1 ? 's' : ''} selected
          </span>

          <div className="flex items-center gap-2">
            <Button
              disabled={isPending}
              onClick={handleBulkDelete}
              size="sm"
              variant="destructive"
            >
              {isPending ? (
                <>
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="me-2 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button disabled={isExporting} size="sm" variant="outline">
                  {isExporting ? (
                    <>
                      <Loader2 className="me-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="me-2 h-4 w-4 rtl:scale-x-[-1]" />
                      Export
                      <ChevronDown className="ms-1 h-3 w-3 rtl:scale-x-[-1]" />
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  <FileDown className="me-2 h-4 w-4 rtl:scale-x-[-1]" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('json')}>
                  <FileDown className="me-2 h-4 w-4 rtl:scale-x-[-1]" />
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleCopyIds}>
                  <Copy className="me-2 h-4 w-4" />
                  Copy IDs
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Button onClick={onClearSelection} size="sm" variant="ghost">
          <X className="me-2 h-4 w-4" />
          Clear selection
        </Button>
      </div>
    </Card>
  );
}
