// =============================================================================
// Brand Settings Form Component
// =============================================================================
// Form for updating brand settings (logo, name display)
// =============================================================================

'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ImageUpload } from '@/components/products/ImageUpload';

// =============================================================================
// Types & Validation
// =============================================================================

const brandSettingsSchema = z.object({
  logoUrl: z
    .string()
    .refine(
      (val) => !val || val.startsWith('http://') || val.startsWith('https://') || val.startsWith('/'),
      { message: 'Must be a valid URL' }
    )
    .optional()
    .or(z.literal('')),
});

type BrandSettingsFormData = z.infer<typeof brandSettingsSchema>;

export interface BrandSettingsFormProps {
  name: string;
  logoUrl?: string;
}

// =============================================================================
// Brand Settings Form Component
// =============================================================================

export function BrandSettingsForm({ name, logoUrl }: BrandSettingsFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<BrandSettingsFormData>({
    resolver: zodResolver(brandSettingsSchema),
    defaultValues: {
      logoUrl: logoUrl || '',
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: BrandSettingsFormData) => {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update brand settings');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Brand settings updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (error: Error) => {
      console.error('Brand settings update error:', error);
      toast.error(error.message || 'Failed to update brand settings');
    },
  });

  const onSubmit = (data: BrandSettingsFormData) => {
    updateMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Brand Name - Read Only */}
        <div className="space-y-2">
          <FormLabel>Brand Name</FormLabel>
          <div className="rounded-md border border-input bg-muted px-3 py-2 text-sm">
            {name}
          </div>
          <p className="text-xs text-muted-foreground">
            Contact support to change your brand name
          </p>
        </div>

        {/* Logo Upload */}
        <FormField
          control={form.control}
          name="logoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brand Logo</FormLabel>
              <FormControl>
                <ImageUpload
                  value={field.value || ''}
                  onValueChange={field.onChange}
                  disabled={updateMutation.isPending}
                />
              </FormControl>
              <FormDescription>
                Upload your brand logo (JPG, PNG, or WebP, max 5MB)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Logo Preview */}
        {form.watch('logoUrl') && (
          <div className="space-y-2">
            <FormLabel>Logo Preview</FormLabel>
            <div className="rounded-lg border border-slate-200 p-4 bg-white">
              <div className="flex items-center gap-4">
                <img
                  src={form.watch('logoUrl')}
                  alt={name}
                  className="h-16 w-16 object-contain rounded"
                />
                <div>
                  <p className="font-medium">{name}</p>
                  <p className="text-sm text-muted-foreground">
                    This is how your logo will appear
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <Button
          type="submit"
          disabled={updateMutation.isPending}
          className="min-w-[120px]"
        >
          {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </Form>
  );
}
