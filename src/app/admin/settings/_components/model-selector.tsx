'use client';

import { Check, ChevronsUpDown, Database } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { AdminModel } from '@/lib/admin/types';
import { cn } from '@/lib/utils';

interface ModelSelectorProps {
  models: AdminModel[];
  selectedModel: string | null;
  onSelectModel: (modelId: string) => void;
}

export function ModelSelector({
  models,
  selectedModel,
  onSelectModel,
}: ModelSelectorProps) {
  const [open, setOpen] = useState(false);

  const selected = models.find((m) => m.id === selectedModel);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          className="w-full justify-between"
          role="combobox"
          variant="outline"
        >
          <div className="flex items-center">
            <Database className="mr-2 h-4 w-4" />
            {selected ? selected.name : 'Select model...'}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0">
        <Command>
          <CommandInput placeholder="Search models..." />
          <CommandEmpty>No model found.</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {models.map((model) => (
                <CommandItem
                  className="hover:bg-transparent focus:bg-accent"
                  key={model.id}
                  onSelect={() => {
                    onSelectModel(model.id);
                    setOpen(false);
                  }}
                  value={model.name}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedModel === model.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{model.name}</div>
                    <div className="text-muted-foreground text-xs">
                      {model.fields.length} fields •{' '}
                      {model.displayFields.join(', ')}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
