'use client';

import { Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function GeneralSettings() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="appName">Application Name</Label>
          <Input
            defaultValue="Admin Panel"
            id="appName"
            placeholder="My Admin Panel"
          />
          <p className="text-muted-foreground text-sm">
            The name displayed in the admin panel header
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="itemsPerPage">Items Per Page</Label>
          <Input
            defaultValue="10"
            id="itemsPerPage"
            max="100"
            min="5"
            placeholder="10"
            type="number"
          />
          <p className="text-muted-foreground text-sm">
            Default number of items to show per page in tables
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateFormat">Date Format</Label>
          <Input
            defaultValue="MM/DD/YYYY"
            id="dateFormat"
            placeholder="MM/DD/YYYY"
          />
          <p className="text-muted-foreground text-sm">
            Format for displaying dates throughout the admin panel
          </p>
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          General settings are coming soon. These settings will allow you to
          customize the overall behavior and appearance of your admin panel.
        </AlertDescription>
      </Alert>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h3 className="mb-2 font-semibold">About Settings</h3>
          <div className="space-y-2 text-muted-foreground text-sm">
            <p>
              The admin settings are stored in{' '}
              <code className="rounded bg-background px-1 py-0.5">
                adminSettings.json
              </code>{' '}
              at the root of your project.
            </p>
            <p>
              Changes made here will update the JSON file, which is used to
              configure how your admin panel displays and manages data.
            </p>
            <p>
              You can also edit the JSON file directly if you prefer, but using
              this interface ensures valid configuration.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
