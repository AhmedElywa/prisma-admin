import type React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn('flex items-center justify-between space-y-2', className)}
    >
      <div>
        <h2 className="text-start font-bold text-3xl tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="text-start text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
