'use client';

// =============================================================================
// Brand Settings Page
// =============================================================================
// Allows store owners to configure their brand identity.
// =============================================================================

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ColorPicker } from '@/components/ui/color-picker';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FileUpload } from '@/components/ui/file-upload';
import { BrandPreview } from '@/components/brand/BrandPreview';
import { WhatsAppSettings } from '@/components/whatsapp/WhatsAppSettings';

// =============================================================================
// Types
// =============================================================================

interface BrandSettings {
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  borderRadius: string;
  name: string;
  slug: string;
}

const BORDER_RADIUS_OPTIONS = [
  { value: '0rem', label: 'Sharp', description: 'Cantos retos' },
  { value: '0.5rem', label: 'Soft', description: 'Levemente arredondado' },
  { value: '1rem', label: 'Rounded', description: 'Arredondado' },
  { value: '9999px', label: 'Pill', description: 'Totalmente arredondado' },
];

// =============================================================================
// Main Component
// =============================================================================

function BrandSettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenantId = searchParams.get('tenantId');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#0f172a');
  const [secondaryColor, setSecondaryColor] = useState('#64748b');
  const [borderRadius, setBorderRadius] = useState('0.5rem');
  const [storeName, setStoreName] = useState('');

  // Local preview for uploaded logo (before saving)
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // =============================================================================
  // Load brand settings
  // =============================================================================

  useEffect(() => {
    if (!tenantId) {
      setError('ID do tenant não fornecido. Adicione ?tenantId=XXX na URL.');
      setIsLoading(false);
      return;
    }

    async function loadSettings() {
      try {
        const response = await fetch(`/api/tenant/brand?tenantId=${tenantId}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error?.message || 'Erro ao carregar configurações');
        }

        const settings: BrandSettings = result.data;
        setLogoUrl(settings.logoUrl);
        setLogoPreview(settings.logoUrl);
        setPrimaryColor(settings.primaryColor);
        setSecondaryColor(settings.secondaryColor);
        setBorderRadius(settings.borderRadius);
        setStoreName(settings.name);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar configurações');
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, [tenantId]);

  // =============================================================================
  // Handle logo upload
  // =============================================================================

  const handleLogoUpload = async (file: File) => {
    if (!tenantId) return;

    setIsUploading(true);
    setError(null);

    // Show local preview immediately
    const localPreview = URL.createObjectURL(file);
    setLogoPreview(localPreview);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/tenant/logo?tenantId=${tenantId}`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Erro ao fazer upload');
      }

      setLogoUrl(result.data.logoUrl);
      setLogoPreview(result.data.logoUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer upload');
      setLogoPreview(logoUrl); // Revert to original
    } finally {
      setIsUploading(false);
    }
  };

  // =============================================================================
  // Handle save
  // =============================================================================

  const handleSave = async () => {
    if (!tenantId) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/tenant/brand?tenantId=${tenantId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logoUrl,
          primaryColor,
          secondaryColor,
          borderRadius,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Erro ao salvar configurações');
      }

      setSuccess('Configurações salvas com sucesso!');

      // Redirect to dashboard after short delay
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  // =============================================================================
  // Render
  // =============================================================================

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  if (error && !tenantId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Configurações de Marca</h1>
          <p className="text-muted-foreground">
            Personalize a identidade visual do seu catálogo
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 rounded-md bg-destructive/10 text-destructive">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 rounded-md bg-green-500/10 text-green-600">
            {success}
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Logo */}
            <Card>
              <CardHeader>
                <CardTitle>Logo</CardTitle>
                <CardDescription>
                  Faça upload do logo da sua loja (PNG ou JPG, máx. 2MB)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload
                  onFileSelect={handleLogoUpload}
                  preview={logoPreview}
                  isLoading={isUploading}
                />
              </CardContent>
            </Card>

            {/* Colors */}
            <Card>
              <CardHeader>
                <CardTitle>Cores</CardTitle>
                <CardDescription>
                  Escolha as cores que representam sua marca
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ColorPicker
                  label="Cor Primária"
                  color={primaryColor}
                  onChange={setPrimaryColor}
                />
                <ColorPicker
                  label="Cor Secundária"
                  color={secondaryColor}
                  onChange={setSecondaryColor}
                />
              </CardContent>
            </Card>

            {/* Border Radius */}
            <Card>
              <CardHeader>
                <CardTitle>Estilo de Bordas</CardTitle>
                <CardDescription>
                  Escolha o arredondamento dos elementos visuais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={borderRadius}
                  onValueChange={setBorderRadius}
                  className="grid grid-cols-2 gap-4"
                >
                  {BORDER_RADIUS_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                        borderRadius === option.value
                          ? 'border-primary bg-primary/5'
                          : 'border-input hover:border-primary/50'
                      }`}
                    >
                      <RadioGroupItem value={option.value} className="mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{option.label}</span>
                          <div
                            className="w-4 h-4 bg-slate-300 dark:bg-slate-600"
                            style={{ borderRadius: option.value }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {option.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* WhatsApp Settings */}
            {tenantId && (
              <WhatsAppSettings tenantId={tenantId} />
            )}

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={isSaving || isUploading}
                size="lg"
              >
                {isSaving ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </div>
          </div>

          {/* Preview */}
          <div className="lg:col-span-1">
            <BrandPreview
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              borderRadius={borderRadius}
              logoUrl={logoPreview}
              storeName={storeName}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Export with Suspense
// =============================================================================

export default function BrandSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <BrandSettingsContent />
    </Suspense>
  );
}
