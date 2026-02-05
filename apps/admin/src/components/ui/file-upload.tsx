'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from './label';
import { Button } from './button';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number;
  label?: string;
  preview?: string | null;
  isLoading?: boolean;
  className?: string;
}

export function FileUpload({
  onFileSelect,
  accept = 'image/png,image/jpeg',
  maxSize = 2 * 1024 * 1024, // 2MB
  label,
  preview,
  isLoading = false,
  className,
}: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [dragActive, setDragActive] = React.useState(false);

  const handleFile = (file: File) => {
    setError(null);

    // Validate type
    const acceptedTypes = accept.split(',').map((t) => t.trim());
    if (!acceptedTypes.includes(file.type)) {
      setError('Tipo de arquivo não permitido. Use PNG ou JPG.');
      return;
    }

    // Validate size
    if (file.size > maxSize) {
      setError(`Arquivo muito grande. Máximo ${Math.round(maxSize / 1024 / 1024)}MB.`);
      return;
    }

    onFileSelect(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && <Label>{label}</Label>}

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          'relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg transition-colors',
          dragActive
            ? 'border-primary bg-primary/5'
            : 'border-input hover:border-primary/50',
          isLoading && 'opacity-50 pointer-events-none'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
          disabled={isLoading}
        />

        {preview ? (
          <div className="relative w-full h-full p-2">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-contain rounded"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => inputRef.current?.click()}
              className="absolute bottom-4 right-4"
              disabled={isLoading}
            >
              {isLoading ? 'Enviando...' : 'Alterar'}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 p-4">
            <svg
              className="w-10 h-10 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm text-muted-foreground text-center">
              Arraste uma imagem ou{' '}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-primary hover:underline font-medium"
                disabled={isLoading}
              >
                clique para selecionar
              </button>
            </p>
            <p className="text-xs text-muted-foreground">PNG ou JPG (máx. 2MB)</p>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
