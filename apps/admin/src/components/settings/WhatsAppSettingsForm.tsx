// =============================================================================
// WhatsApp Settings Form Component
// =============================================================================
// Form for updating WhatsApp contact numbers with validation and formatting
// =============================================================================

'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle } from 'lucide-react';

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
import { PhoneInput } from '@/components/ui/phone-input';
import { Card } from '@/components/ui/card';

// =============================================================================
// Types & Validation
// =============================================================================

const whatsappSettingsSchema = z.object({
  whatsappPrimary: z
    .string()
    .regex(/^\+\d{1,4}\d{10,11}$/, 'Must be a valid phone number format (+5511999999999)')
    .optional()
    .or(z.literal('')),
  whatsappSecondary: z
    .string()
    .regex(/^\+\d{1,4}\d{10,11}$/, 'Must be a valid phone number format (+5511999999999)')
    .optional()
    .or(z.literal('')),
});

type WhatsAppSettingsFormData = z.infer<typeof whatsappSettingsSchema>;

export interface WhatsAppSettingsFormProps {
  whatsappPrimary?: string;
  whatsappSecondary?: string;
}

// =============================================================================
// Helper Functions
// =============================================================================

function formatPhoneNumber(phone: string | undefined | null): string {
  if (!phone) return '';

  // Remove + from start for formatting
  const cleaned = phone.replace(/^\+/, '');

  // Format as +55 11 99999-9999
  const countryCode = cleaned.slice(0, 2);
  const areaCode = cleaned.slice(2, 4);
  const firstPart = cleaned.slice(4, 9);
  const secondPart = cleaned.slice(9);

  return `+${countryCode} ${areaCode} ${firstPart}-${secondPart}`;
}

// =============================================================================
// WhatsApp Settings Form Component
// =============================================================================

export function WhatsAppSettingsForm({
  whatsappPrimary,
  whatsappSecondary,
}: WhatsAppSettingsFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<WhatsAppSettingsFormData>({
    resolver: zodResolver(whatsappSettingsSchema),
    defaultValues: {
      whatsappPrimary: whatsappPrimary || '',
      whatsappSecondary: whatsappSecondary || '',
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: WhatsAppSettingsFormData) => {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update WhatsApp settings');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('WhatsApp settings updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (error: Error) => {
      console.error('WhatsApp settings update error:', error);
      toast.error(error.message || 'Failed to update WhatsApp settings');
    },
  });

  const onSubmit = (data: WhatsAppSettingsFormData) => {
    updateMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Primary WhatsApp Number */}
        <FormField
          control={form.control}
          name="whatsappPrimary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primary WhatsApp Number</FormLabel>
              <FormControl>
                <PhoneInput
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder="+5511999999999"
                  disabled={updateMutation.isPending}
                  error={form.formState.errors.whatsappPrimary?.message}
                />
              </FormControl>
              <FormDescription>
                Main WhatsApp contact number for customer inquiries
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Secondary WhatsApp Number */}
        <FormField
          control={form.control}
          name="whatsappSecondary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Secondary WhatsApp Number (Optional)</FormLabel>
              <FormControl>
                <PhoneInput
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder="+5511999999999"
                  disabled={updateMutation.isPending}
                  error={form.formState.errors.whatsappSecondary?.message}
                />
              </FormControl>
              <FormDescription>
                Alternative WhatsApp contact number
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Preview Card */}
        {(form.watch('whatsappPrimary') || form.watch('whatsappSecondary')) && (
          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MessageCircle className="h-4 w-4" />
              Preview
            </div>
            <div className="space-y-2">
              {form.watch('whatsappPrimary') && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <MessageCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-700">Primary</p>
                    <p className="text-slate-600">
                      {formatPhoneNumber(form.watch('whatsappPrimary'))}
                    </p>
                  </div>
                </div>
              )}
              {form.watch('whatsappSecondary') && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                    <MessageCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-700">Secondary</p>
                    <p className="text-slate-600">
                      {formatPhoneNumber(form.watch('whatsappSecondary'))}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
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
