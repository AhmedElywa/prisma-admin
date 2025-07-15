'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Info } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function GeneralSettings() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="appName">Application Name</Label>
          <Input
            id="appName"
            placeholder="My Admin Panel"
            defaultValue="Admin Panel"
          />
          <p className="text-sm text-muted-foreground">
            The name displayed in the admin panel header
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="itemsPerPage">Items Per Page</Label>
          <Input
            id="itemsPerPage"
            type="number"
            placeholder="10"
            defaultValue="10"
            min="5"
            max="100"
          />
          <p className="text-sm text-muted-foreground">
            Default number of items to show per page in tables
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="dateFormat">Date Format</Label>
          <Input
            id="dateFormat"
            placeholder="MM/DD/YYYY"
            defaultValue="MM/DD/YYYY"
          />
          <p className="text-sm text-muted-foreground">
            Format for displaying dates throughout the admin panel
          </p>
        </div>
      </div>
      
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          General settings are coming soon. These settings will allow you to customize
          the overall behavior and appearance of your admin panel.
        </AlertDescription>
      </Alert>
      
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">About Settings</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              The admin settings are stored in <code className="bg-background px-1 py-0.5 rounded">adminSettings.json</code> at
              the root of your project.
            </p>
            <p>
              Changes made here will update the JSON file, which is used to configure
              how your admin panel displays and manages data.
            </p>
            <p>
              You can also edit the JSON file directly if you prefer, but using this
              interface ensures valid configuration.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}