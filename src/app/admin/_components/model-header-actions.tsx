'use client';

import { Download, FileSpreadsheet, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { exportToCSV } from '@/lib/actions/import';
import type { AdminField } from '@/lib/admin/types';
import { CSVImport } from './csv-import';

interface ModelHeaderActionsProps {
  modelName: string;
  modelPath: string;
  canCreate: boolean;
  fields: AdminField[];
}

export function ModelHeaderActions({
  modelName,
  modelPath,
  canCreate,
  fields,
}: ModelHeaderActionsProps) {
  const [showImport, setShowImport] = useState(false);
  const [exporting, setExporting] = useState(false);
  const router = useRouter();

  const handleExport = async () => {
    setExporting(true);
    try {
      const csv = await exportToCSV(modelName);

      // Create blob and download
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${modelName.toLowerCase()}-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Data exported successfully');
    } catch (_error) {
      toast.error('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const handleImportSuccess = () => {
    setShowImport(false);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2">
      {/* Export Button */}
      <Button disabled={exporting} onClick={handleExport} variant="outline">
        <Download className="mr-2 h-4 w-4" />
        Export CSV
      </Button>

      {/* Import Button */}
      {canCreate && (
        <Button onClick={() => setShowImport(true)} variant="outline">
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
      <Dialog onOpenChange={setShowImport} open={showImport}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <CSVImport
            fields={fields}
            modelName={modelName}
            onCancel={() => setShowImport(false)}
            onSuccess={handleImportSuccess}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
