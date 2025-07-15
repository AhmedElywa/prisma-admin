import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { regenerateSettings } from '@/lib/actions/settings';
import { getAdminSettings } from '@/lib/admin/settings';
import { SettingsClient } from './_components/settings-client';

export default async function SettingsPage() {
  const settings = await getAdminSettings();

  return (
    <div className="container mx-auto max-w-7xl py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl">Admin Settings</h1>
          <p className="mt-2 text-muted-foreground">
            Configure models, fields, and permissions for your admin panel
          </p>
        </div>
        <form action={regenerateSettings}>
          <Button size="lg" variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Regenerate from Schema
          </Button>
        </form>
      </div>

      <SettingsClient settings={settings} />
    </div>
  );
}
