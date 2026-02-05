// =============================================================================
// Bulk Actions Toolbar Component
// =============================================================================
// Toolbar that appears when products are selected
// Actions: Set Available, Set Unavailable, Cancel
// =============================================================================

'use client';

import * as React from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// =============================================================================
// Types
// =============================================================================

interface BulkActionsProps {
  count: number;
  onSetAvailable: () => void;
  onSetUnavailable: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

// =============================================================================
// Component
// =============================================================================

export function BulkActions({
  count,
  onSetAvailable,
  onSetUnavailable,
  onCancel,
  isLoading = false,
}: BulkActionsProps) {
  return (
    <div
      className={cn(
        'fixed bottom-4 left-1/2 -translate-x-1/2 z-50',
        'bg-slate-900 text-white rounded-lg shadow-2xl',
        'px-6 py-4 flex items-center gap-4',
        'animate-in slide-in-from-bottom-4 duration-300'
      )}
    >
      {/* Selected Count */}
      <div className="flex items-center gap-2">
        <span className="font-medium">{count}</span>
        <span className="text-slate-300">
          {count === 1 ? 'product' : 'products'} selected
        </span>
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-slate-700" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={onSetAvailable}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Set Available
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={onSetUnavailable}
          disabled={isLoading}
          className="bg-slate-700 hover:bg-slate-600 text-white"
        >
          <XCircle className="mr-2 h-4 w-4" />
          Set Unavailable
        </Button>
      </div>

      {/* Cancel Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onCancel}
        disabled={isLoading}
        className="text-slate-300 hover:text-white hover:bg-slate-800"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Cancel</span>
      </Button>
    </div>
  );
}
