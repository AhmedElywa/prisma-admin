'use client';

import { Link, Loader2, Search, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getModelData } from '@/lib/actions/crud';
import { getModelSettingsData } from '@/lib/actions/form-data';
import { cn } from '@/lib/utils';

interface RelationConnectProps {
  name: string;
  label: string;
  relatedModel: string;
  value?: any[];
  modelId: string | number;
  modelName: string;
}

export function RelationConnect({
  name,
  label,
  relatedModel,
  value = [],
  modelId,
  modelName,
}: RelationConnectProps) {
  const [connected, setConnected] = useState<any[]>(value);
  const [available, setAvailable] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [modelSettings, setModelSettings] = useState<any>(null);

  useEffect(() => {
    const loadModelSettings = async () => {
      try {
        const settings = await getModelSettingsData(relatedModel);
        setModelSettings(settings);
      } catch {
        // ignore
      }
    };

    loadModelSettings();
  }, [relatedModel]);

  const loadAvailable = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getModelData(relatedModel, {
        page: 1,
        perPage: 50,
        search,
      });

      // Filter out already connected items
      const connectedIds = connected.map((item: any) => item.id);
      const filtered = result.data.filter(
        (item: any) => !connectedIds.includes(item.id)
      );
      setAvailable(filtered);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [relatedModel, search, connected]);

  useEffect(() => {
    if (modelSettings) {
      loadAvailable();
    }
  }, [modelSettings, loadAvailable]);

  const connect = (item: any) => {
    setConnected([...connected, item]);
    setAvailable(available.filter((a: any) => a.id !== item.id));
  };

  const disconnect = (item: any) => {
    setConnected(connected.filter((c: any) => c.id !== item.id));
    setAvailable(
      [...available, item].sort((a, b) => {
        const aDisplay = getItemDisplay(a).toLowerCase();
        const bDisplay = getItemDisplay(b).toLowerCase();
        return aDisplay.localeCompare(bDisplay);
      })
    );
  };

  const getItemDisplay = (item: any) => {
    if (!modelSettings) {
      return item.name || item.title || item.email || item.id || 'Unknown';
    }

    // Use display fields from settings
    const displayFields = modelSettings.displayFields || ['id'];
    const displayValues = displayFields
      .map((field: string) => {
        const value = item[field];
        if (value === null || value === undefined) {
          return '';
        }
        if (typeof value === 'object') {
          return JSON.stringify(value);
        }
        return value;
      })
      .filter(Boolean);

    return displayValues.join(' - ') || item.id;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        <CardDescription>
          Connect and disconnect {relatedModel.toLowerCase()} records
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hidden inputs for form submission */}
        {connected.map((item, index) => (
          <input
            key={`${name}-${item.id}`}
            name={`${name}[${index}]`}
            type="hidden"
            value={item.id}
          />
        ))}

        {/* Connected items */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label>Connected ({connected.length})</Label>
            {connected.length > 0 && (
              <Button
                className="text-xs"
                onClick={() => {
                  setAvailable(
                    [...available, ...connected].sort((a, b) => {
                      const aDisplay = getItemDisplay(a).toLowerCase();
                      const bDisplay = getItemDisplay(b).toLowerCase();
                      return aDisplay.localeCompare(bDisplay);
                    })
                  );
                  setConnected([]);
                }}
                size="sm"
                type="button"
                variant="ghost"
              >
                Disconnect All
              </Button>
            )}
          </div>
          <div className="min-h-[100px] rounded-md border bg-muted/30 p-3">
            {connected.length === 0 ? (
              <p className="py-4 text-center text-muted-foreground text-sm">
                No connected items
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {connected.map((item) => (
                  <Badge
                    className="gap-1 pr-1 hover:bg-secondary/80"
                    key={item.id}
                    variant="secondary"
                  >
                    <span className="max-w-[200px] truncate">
                      {getItemDisplay(item)}
                    </span>
                    <button
                      className="ml-1 rounded p-0.5 transition-colors hover:bg-destructive/20"
                      onClick={() => disconnect(item)}
                      type="button"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search and available items */}
        <div>
          <Label className="mb-2">Available</Label>
          <div className="mb-2 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              className="flex-1"
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${relatedModel.toLowerCase()}...`}
              value={search}
            />
          </div>

          <ScrollArea className="h-[200px] rounded-md border">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : available.length === 0 ? (
              <div className="flex h-full items-center justify-center p-4 text-center text-muted-foreground">
                {search ? (
                  <p className="text-sm">No matching items found</p>
                ) : (
                  <p className="text-sm">All items are already connected</p>
                )}
              </div>
            ) : (
              <div className="divide-y">
                {available.map((item) => (
                  <button
                    className={cn(
                      'flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-accent',
                      'group cursor-pointer'
                    )}
                    key={item.id}
                    onClick={() => connect(item)}
                    type="button"
                  >
                    <span className="max-w-[300px] truncate text-sm">
                      {getItemDisplay(item)}
                    </span>
                    <Button
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                      size="sm"
                      type="button"
                      variant="ghost"
                    >
                      <Link className="h-4 w-4" />
                    </Button>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>

          {!loading && available.length > 0 && (
            <p className="mt-2 text-muted-foreground text-xs">
              Click on an item to connect it
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
