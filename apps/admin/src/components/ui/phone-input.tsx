'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from './label';
import { Input } from './input';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function PhoneInput({
  value,
  onChange,
  label,
  placeholder = '+5511999999999',
  hint,
  error,
  disabled = false,
  className,
}: PhoneInputProps) {
  const [isFocused, setIsFocused] = React.useState(false);

  // Format input: only allow + and digits
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Remove anything that's not a digit or +
    const cleaned = input.replace(/[^\d+]/g, '');
    // Ensure + is only at the start
    const formatted = cleaned.startsWith('+')
      ? '+' + cleaned.slice(1).replace(/\+/g, '')
      : cleaned.replace(/\+/g, '');
    onChange(formatted);
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && <Label>{label}</Label>}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </div>
        <Input
          type="tel"
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'pl-10',
            error && 'border-destructive focus-visible:ring-destructive'
          )}
        />
      </div>
      
      {/* Hint or Error */}
      {(hint || error) && (
        <p
          className={cn(
            'text-xs',
            error ? 'text-destructive' : 'text-muted-foreground'
          )}
        >
          {error || hint}
        </p>
      )}
      
      {/* Format Example (show on focus) */}
      {isFocused && !error && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <span className="font-medium">Formato:</span>
          <code className="bg-muted px-1 rounded">+CCNNNNNNNNN</code>
          <span className="text-muted-foreground/70">ex: +5511999999999</span>
        </p>
      )}
    </div>
  );
}
