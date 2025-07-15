import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getAdminSettings } from '@/lib/admin/settings'
import { GeneralSettings } from './_components/general-settings'
import { RefreshCw, Settings2, Database } from 'lucide-react'
import { regenerateSettings } from '@/lib/actions/settings'
import { SettingsClient } from './_components/settings-client'

export default async function SettingsPage() {
  const settings = await getAdminSettings()
  
  return (
    <div className="container mx-auto py-10 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure models, fields, and permissions for your admin panel
          </p>
        </div>
        <form action={regenerateSettings}>
          <Button variant="outline" size="lg">
            <RefreshCw className="mr-2 h-4 w-4" />
            Regenerate from Schema
          </Button>
        </form>
      </div>
      
      <SettingsClient settings={settings} />
    </div>
  )
}