// =============================================================================
// Empty State Component
// =============================================================================
// Reusable empty state component for various empty data scenarios
// =============================================================================

import * as React from 'react';
import { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

// =============================================================================
// Types
// =============================================================================

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center',
        className
      )}
    >
      <div className="rounded-full bg-slate-100 p-6 mb-4">
        <Icon className="h-12 w-12 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-slate-600 max-w-md mb-6">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
