'use client';

// =============================================================================
// WhatsApp Settings Component
// =============================================================================
// Allows store owners to configure WhatsApp contact numbers.
// =============================================================================

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PhoneInput } from '@/components/ui/phone-input';

// =============================================================================
// Types
// =============================================================================

interface WhatsAppSettingsProps {
  tenantId: string;
  onSaveSuccess?: () => void;
}

interface WhatsAppData {
  whatsappPrimary: string | null;
  whatsappSecondary: string | null;
}

// =============================================================================
// Validation
// =============================================================================

const PHONE_REGEX = /^\+[1-9]\d{10,14}$/;

function validatePhone(phone: string): string | null {
  if (!phone) return null; // Empty is OK (optional)
  if (!PHONE_REGEX.test(phone)) {
    return 'Número deve incluir código do país (ex: +5511999999999)';
  }
  return null;
}

// =============================================================================
// Component
// =============================================================================

export function WhatsAppSettings({ tenantId, onSaveSuccess }: WhatsAppSettingsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [whatsappPrimary, setWhatsappPrimary] = useState('');
  const [whatsappSecondary, setWhatsappSecondary] = useState('');

  // Validation errors
  const [primaryError, setPrimaryError] = useState<string | null>(null);
  const [secondaryError, setSecondaryError] = useState<string | null>(null);

  // =============================================================================
  // Load settings
  // =============================================================================

  useEffect(() => {
    if (!tenantId) {
      setIsLoading(false);
      return;
    }

    async function loadSettings() {
      try {
        const response = await fetch(`/api/tenant/whatsapp?tenantId=${tenantId}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error?.message || 'Erro ao carregar configurações');
        }

        const data: WhatsAppData = result.data;
        setWhatsappPrimary(data.whatsappPrimary || '');
        setWhatsappSecondary(data.whatsappSecondary || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar');
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, [tenantId]);

  // =============================================================================
  // Validate on change
  // =============================================================================

  const handlePrimaryChange = (value: string) => {
    setWhatsappPrimary(value);
    setPrimaryError(validatePhone(value));
    setSuccess(null);
  };

  const handleSecondaryChange = (value: string) => {
    setWhatsappSecondary(value);
    setSecondaryError(validatePhone(value));
    setSuccess(null);
  };

  // =============================================================================
  // Save handler
  // =============================================================================

  const handleSave = async () => {
    // Validate before save
    const primaryValidation = validatePhone(whatsappPrimary);
    const secondaryValidation = validatePhone(whatsappSecondary);

    setPrimaryError(primaryValidation);
    setSecondaryError(secondaryValidation);

    if (primaryValidation || secondaryValidation) {
      return; // Block save if validation errors
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/tenant/whatsapp?tenantId=${tenantId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          whatsappPrimary: whatsappPrimary || null,
          whatsappSecondary: whatsappSecondary || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Erro ao salvar');
      }

      setSuccess('Números de WhatsApp salvos com sucesso!');
      onSaveSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setIsSaving(false);
    }
  };

  // =============================================================================
  // Render
  // =============================================================================

  const hasErrors = !!primaryError || !!secondaryError;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-green-500"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          WhatsApp
        </CardTitle>
        <CardDescription>
          Configure os números de WhatsApp para atendimento ao cliente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : (
          <>
            {/* Error Alert */}
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Success Alert */}
            {success && (
              <div className="p-3 rounded-md bg-green-500/10 text-green-600 text-sm">
                {success}
              </div>
            )}

            {/* Primary Number */}
            <PhoneInput
              label="WhatsApp Principal"
              value={whatsappPrimary}
              onChange={handlePrimaryChange}
              placeholder="+5511999999999"
              hint="Número principal para atendimento"
              error={primaryError || undefined}
              disabled={isSaving}
            />

            {/* Secondary Number */}
            <PhoneInput
              label="WhatsApp Secundário (opcional)"
              value={whatsappSecondary}
              onChange={handleSecondaryChange}
              placeholder="+5511999999999"
              hint="Para ofertas, promoções ou grupos"
              error={secondaryError || undefined}
              disabled={isSaving}
            />

            {/* Save Button */}
            <div className="pt-2">
              <Button
                onClick={handleSave}
                disabled={isSaving || hasErrors}
                className="w-full sm:w-auto"
              >
                {isSaving ? 'Salvando...' : 'Salvar WhatsApp'}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
