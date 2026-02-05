// =============================================================================
// Settings Page
// =============================================================================
// Main tenant settings page with tabs for different configuration sections
// =============================================================================

'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Settings2, MessageCircle, Palette } from 'lucide-react';
import Link from 'next/link';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BrandSettingsForm } from '@/components/settings/BrandSettingsForm';
import { WhatsAppSettingsForm } from '@/components/settings/WhatsAppSettingsForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// =============================================================================
// Types
// =============================================================================

interface TenantSettings {
  name: string;
  slug: string;
  logoUrl?: string;
  whatsappPrimary?: string;
  whatsappSecondary?: string;
  primaryColor?: string;
  secondaryColor?: string;
  borderRadius?: string;
}

// =============================================================================
// Loading Skeleton
// =============================================================================

function SettingsSkeleton() {
  return (
    <div className="container mx-auto p-8 space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-40 bg-slate-200 rounded animate-pulse" />
        <div className="h-4 w-80 bg-slate-200 rounded animate-pulse" />
      </div>
      <div className="h-10 w-full max-w-md bg-slate-200 rounded animate-pulse" />
      <div className="space-y-4">
        <div className="h-20 w-full bg-slate-200 rounded animate-pulse" />
        <div className="h-20 w-full bg-slate-200 rounded animate-pulse" />
        <div className="h-20 w-full bg-slate-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

// =============================================================================
// Settings Page Component
// =============================================================================

export default function SettingsPage() {
  // Fetch settings
  const { data: settings, isLoading, error } = useQuery<TenantSettings>({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await fetch('/api/settings');
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }
      return response.json();
    },
  });

  // Loading state
  if (isLoading) {
    return <SettingsSkeleton />;
  }

  // Error state
  if (error || !settings) {
    return (
      <div className="container mx-auto p-8">
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">
          <p className="font-semibold">Error loading settings</p>
          <p className="text-sm">
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your store configuration and preferences
        </p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="brand" className="space-y-6">
        <TabsList>
          <TabsTrigger value="brand" className="gap-2">
            <Settings2 className="h-4 w-4" />
            Marca
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </TabsTrigger>
        </TabsList>

        {/* Brand Settings Tab */}
        <TabsContent value="brand" className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Brand Settings</h2>
            <p className="text-sm text-muted-foreground">
              Manage your brand identity and logo
            </p>
          </div>
          <div className="max-w-2xl">
            <BrandSettingsForm name={settings.name} logoUrl={settings.logoUrl} />
          </div>
          
          {/* Design Playground Link */}
          <Card className="max-w-2xl mt-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                <CardTitle>Personalização Visual</CardTitle>
              </div>
              <CardDescription>
                Customize cores, fontes, layout e muito mais no nosso editor visual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/design">
                  Abrir Editor de Temas
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* WhatsApp Settings Tab */}
        <TabsContent value="whatsapp" className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">WhatsApp Settings</h2>
            <p className="text-sm text-muted-foreground">
              Configure your WhatsApp contact numbers for customer inquiries
            </p>
          </div>
          <div className="max-w-2xl">
            <WhatsAppSettingsForm
              whatsappPrimary={settings.whatsappPrimary}
              whatsappSecondary={settings.whatsappSecondary}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
