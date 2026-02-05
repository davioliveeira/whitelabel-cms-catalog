// =============================================================================
// Appearance Settings Form Component
// =============================================================================
// Form for updating appearance settings (colors, border radius)
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

// =============================================================================
// Types & Validation
// =============================================================================

const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

const appearanceSettingsSchema = z.object({
  primaryColor: z
    .string()
    .regex(hexColorRegex, 'Cor inválida. Use formato #RRGGBB')
    .optional(),
  secondaryColor: z
    .string()
    .regex(hexColorRegex, 'Cor inválida. Use formato #RRGGBB')
    .optional(),
  borderRadius: z.string().optional(),
});

type AppearanceSettingsFormData = z.infer<typeof appearanceSettingsSchema>;

export interface AppearanceSettingsFormProps {
  primaryColor?: string;
  secondaryColor?: string;
  borderRadius?: string;
}

// =============================================================================
// Appearance Settings Form Component
// =============================================================================

export function AppearanceSettingsForm({
  primaryColor,
  secondaryColor,
  borderRadius,
}: AppearanceSettingsFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<AppearanceSettingsFormData>({
    resolver: zodResolver(appearanceSettingsSchema),
    defaultValues: {
      primaryColor: primaryColor || '#3B82F6',
      secondaryColor: secondaryColor || '#8B5CF6',
      borderRadius: borderRadius || '8',
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: AppearanceSettingsFormData) => {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update appearance settings');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Configurações de aparência atualizadas!');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (error: Error) => {
      console.error('Appearance settings update error:', error);
      toast.error(error.message || 'Falha ao atualizar configurações');
    },
  });

  const onSubmit = (data: AppearanceSettingsFormData) => {
    updateMutation.mutate(data);
  };

  const watchedColors = {
    primary: form.watch('primaryColor'),
    secondary: form.watch('secondaryColor'),
    borderRadius: form.watch('borderRadius'),
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Primary Color */}
        <FormField
          control={form.control}
          name="primaryColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cor Primária</FormLabel>
              <div className="flex gap-3 items-center">
                <FormControl>
                  <Input
                    {...field}
                    placeholder="#3B82F6"
                    disabled={updateMutation.isPending}
                    className="max-w-[200px]"
                  />
                </FormControl>
                <div
                  className="w-10 h-10 rounded border-2 border-slate-300"
                  style={{ backgroundColor: field.value }}
                />
              </div>
              <FormDescription>
                Cor principal do seu site (formato: #RRGGBB)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Secondary Color */}
        <FormField
          control={form.control}
          name="secondaryColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cor Secundária</FormLabel>
              <div className="flex gap-3 items-center">
                <FormControl>
                  <Input
                    {...field}
                    placeholder="#8B5CF6"
                    disabled={updateMutation.isPending}
                    className="max-w-[200px]"
                  />
                </FormControl>
                <div
                  className="w-10 h-10 rounded border-2 border-slate-300"
                  style={{ backgroundColor: field.value }}
                />
              </div>
              <FormDescription>
                Cor secundária para destaques
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Border Radius */}
        <FormField
          control={form.control}
          name="borderRadius"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Arredondamento de Bordas</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={updateMutation.isPending}
              >
                <FormControl>
                  <SelectTrigger className="max-w-[200px]">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="0">Reto (0px)</SelectItem>
                  <SelectItem value="4">Levemente arredondado (4px)</SelectItem>
                  <SelectItem value="8">Arredondado (8px)</SelectItem>
                  <SelectItem value="12">Muito arredondado (12px)</SelectItem>
                  <SelectItem value="16">Circular (16px)</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Define o arredondamento dos cantos dos elementos
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Preview */}
        <div className="space-y-2">
          <FormLabel>Preview</FormLabel>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Veja como as cores ficarão no seu site:
                </p>
                
                {/* Primary Button Preview */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    className="px-6 py-2 text-white font-medium shadow-sm hover:opacity-90 transition-opacity"
                    style={{
                      backgroundColor: watchedColors.primary,
                      borderRadius: `${watchedColors.borderRadius}px`,
                    }}
                  >
                    Botão Primário
                  </button>
                  
                  <button
                    type="button"
                    className="px-6 py-2 text-white font-medium shadow-sm hover:opacity-90 transition-opacity"
                    style={{
                      backgroundColor: watchedColors.secondary,
                      borderRadius: `${watchedColors.borderRadius}px`,
                    }}
                  >
                    Botão Secundário
                  </button>
                </div>

                {/* Card Preview */}
                <div
                  className="p-4 border-2"
                  style={{
                    borderColor: watchedColors.primary,
                    borderRadius: `${watchedColors.borderRadius}px`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12"
                      style={{
                        backgroundColor: watchedColors.primary,
                        borderRadius: `${watchedColors.borderRadius}px`,
                      }}
                    />
                    <div>
                      <h4 className="font-semibold">Card Example</h4>
                      <p className="text-sm text-muted-foreground">
                        Este é um exemplo de como os elementos ficarão
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Actions */}
        <Button
          type="submit"
          disabled={updateMutation.isPending}
          className="min-w-[120px]"
        >
          {updateMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </form>
    </Form>
  );
}
