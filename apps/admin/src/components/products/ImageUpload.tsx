// =============================================================================
// Image Upload Component
// =============================================================================
// Drag-and-drop image upload with server-side optimization
// Uploads images to API endpoint which resizes and converts to WebP
// =============================================================================

'use client';

import * as React from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// =============================================================================
// Types
// =============================================================================

export interface ImageUploadProps {
  /** Current image URL or data URL */
  value?: string;
  /** Callback when image changes */
  onValueChange: (url: string) => void;
  /** Disabled state */
  disabled?: boolean;
}

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// =============================================================================
// Image Upload Component
// =============================================================================

export function ImageUpload({ value, onValueChange, disabled = false }: ImageUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Validate file
  const validateFile = (file: File): boolean => {
    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error('Invalid file type. Please upload JPG, PNG, or WebP images.');
      return false;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File too large. Maximum size is 5MB.');
      return false;
    }

    return true;
  };

  // Handle file upload to API
  const handleFileChange = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!validateFile(file)) return;

    // Create preview while uploading
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message || 'Upload failed');
        setPreviewUrl(null);
        return;
      }

      const data = await response.json();

      // Update form field with uploaded image URL
      onValueChange(data.url);
      setPreviewUrl(null); // Clear preview, use actual URL
      toast.success('Image uploaded and optimized!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    handleFileChange(e.dataTransfer.files);
  };

  // Handle remove image
  const handleRemove = () => {
    onValueChange('');
    setPreviewUrl(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  // Handle click to upload
  const handleClick = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  };

  // Determine what to display
  const displayUrl = value || previewUrl;
  const showLoading = isUploading && previewUrl;

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {!displayUrl ? (
        <div
          onClick={handleClick}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={cn(
            'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 text-center cursor-pointer transition-colors',
            isDragging
              ? 'border-slate-900 bg-slate-50'
              : 'border-slate-300 hover:border-slate-400',
            (disabled || isUploading) && 'opacity-50 cursor-not-allowed'
          )}
        >
          {isUploading ? (
            <Loader2 className="h-10 w-10 text-slate-400 mb-4 animate-spin" />
          ) : (
            <Upload className="h-10 w-10 text-slate-400 mb-4" />
          )}
          <p className="text-sm font-medium text-slate-700 mb-1">
            {isUploading
              ? 'Uploading and optimizing...'
              : isDragging
              ? 'Drop image here'
              : 'Click to upload or drag and drop'}
          </p>
          <p className="text-xs text-slate-500">
            JPG, PNG or WebP (max. 5MB)
          </p>

          <input
            ref={inputRef}
            type="file"
            accept={ALLOWED_FILE_TYPES.join(',')}
            onChange={(e) => handleFileChange(e.target.files)}
            disabled={disabled || isUploading}
            className="hidden"
          />
        </div>
      ) : (
        /* Preview Area */
        <div className="relative rounded-lg border border-slate-200 overflow-hidden">
          <div className="relative aspect-video w-full bg-slate-50">
            <img
              src={displayUrl}
              alt="Product preview"
              className={cn(
                'h-full w-full object-contain',
                showLoading && 'opacity-50'
              )}
            />

            {/* Upload Progress Overlay */}
            {showLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="flex flex-col items-center text-white">
                  <Loader2 className="h-8 w-8 animate-spin mb-2" />
                  <p className="text-sm font-medium">Optimizing image...</p>
                </div>
              </div>
            )}
          </div>

          {/* Remove Button */}
          {!disabled && !isUploading && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
              className="absolute top-2 right-2 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove image</span>
            </Button>
          )}

          {/* Replace Button */}
          {!disabled && !isUploading && (
            <div className="absolute bottom-2 right-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClick}
              >
                <Upload className="mr-2 h-4 w-4" />
                Replace
              </Button>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept={ALLOWED_FILE_TYPES.join(',')}
            onChange={(e) => handleFileChange(e.target.files)}
            disabled={disabled || isUploading}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
