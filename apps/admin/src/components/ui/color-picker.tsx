'use client';

import * as React from 'react';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import { cn } from '@/lib/utils';
import { Label } from './label';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
  className?: string;
}

export function ColorPicker({
  color,
  onChange,
  label,
  className,
}: ColorPickerProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && <Label>{label}</Label>}
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-3 w-full h-10 px-3 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <div
              className="w-6 h-6 rounded border border-input shadow-sm"
              style={{ backgroundColor: color }}
            />
            <span className="text-sm font-mono uppercase">{color}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3">
          <HexColorPicker color={color} onChange={onChange} />
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">#</span>
            <HexColorInput
              color={color}
              onChange={onChange}
              prefixed={false}
              className="flex-1 h-8 px-2 text-sm font-mono uppercase rounded border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
