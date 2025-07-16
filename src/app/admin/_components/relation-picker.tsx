'use client';

import { Search, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getModelData } from '@/lib/actions/crud';

interface RelationPickerProps {
  name: string;
  label: string;
  relatedModel: string;
  value?: any;
  required?: boolean;
  disabled?: boolean;
}

export function RelationPicker({
  name,
  label,
  relatedModel,
  value,
  required = false,
  disabled = false,
}: RelationPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(value);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getModelData(relatedModel, {
        page: 1,
        perPage: 20,
        search,
      });
      setItems(result.data);
    } catch (_error) {
    } finally {
      setLoading(false);
    }
  }, [relatedModel, search]);

  useEffect(() => {
    if (isOpen) {
      loadItems();
    }
  }, [isOpen, loadItems]);

  const selectItem = (item: any) => {
    setSelectedItem(item);
    setIsOpen(false);
  };

  const clearSelection = () => {
    setSelectedItem(null);
  };

  const getItemDisplay = (item: any) => {
    if (!item) {
      return 'None';
    }
    // Try common display fields
    return item.name || item.title || item.email || item.id || 'Unknown';
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="ms-1 text-red-500">*</span>}
      </Label>

      <input name={name} type="hidden" value={selectedItem?.id || ''} />

      <div className="flex gap-2">
        <div className="flex-1 rounded-md border bg-muted p-2">
          {selectedItem ? (
            <span className="text-sm">{getItemDisplay(selectedItem)}</span>
          ) : (
            <span className="text-muted-foreground text-sm">None selected</span>
          )}
        </div>

        <Dialog onOpenChange={setIsOpen} open={isOpen}>
          <DialogTrigger asChild>
            <Button disabled={disabled} type="button" variant="outline">
              Select
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Select {label}</DialogTitle>
              <DialogDescription>
                Choose a {relatedModel.toLowerCase()} to connect
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  className="flex-1"
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  value={search}
                />
              </div>

              <div className="max-h-[400px] overflow-y-auto rounded-md border">
                {loading ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Loading...
                  </div>
                ) : items.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No items found
                  </div>
                ) : (
                  <div className="divide-y">
                    {items.map((item) => (
                      <button
                        className="flex w-full items-center justify-between p-3 text-start transition-colors hover:bg-accent"
                        key={item.id}
                        onClick={() => selectItem(item)}
                        type="button"
                      >
                        <div>
                          <div className="font-medium">
                            {getItemDisplay(item)}
                          </div>
                          {item.id && (
                            <div className="text-muted-foreground text-sm">
                              ID: {item.id}
                            </div>
                          )}
                        </div>
                        {selectedItem?.id === item.id && (
                          <div className="text-primary">✓</div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {selectedItem && !required && (
          <Button
            disabled={disabled}
            onClick={clearSelection}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
