'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface BrandPreviewProps {
  primaryColor: string;
  secondaryColor: string;
  borderRadius: string;
  logoUrl?: string | null;
  storeName?: string;
}

export function BrandPreview({
  primaryColor,
  secondaryColor,
  borderRadius,
  logoUrl,
  storeName = 'Minha Loja',
}: BrandPreviewProps) {
  // Convert borderRadius to Tailwind-compatible value
  const radiusStyle = {
    borderRadius: borderRadius,
  };

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="text-lg">Preview</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Preview Container */}
        <div
          className="p-4 rounded-lg border bg-slate-50 dark:bg-slate-900"
          style={
            {
              '--preview-primary': primaryColor,
              '--preview-secondary': secondaryColor,
            } as React.CSSProperties
          }
        >
          {/* Header Preview */}
          <div className="flex items-center gap-3 mb-4 pb-3 border-b">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo"
                className="h-8 w-auto object-contain"
              />
            ) : (
              <div
                className="h-8 w-8 flex items-center justify-center text-white text-xs font-bold"
                style={{
                  backgroundColor: primaryColor,
                  ...radiusStyle,
                }}
              >
                {storeName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="font-semibold text-sm">{storeName}</span>
          </div>

          {/* Buttons Preview */}
          <div className="space-y-3 mb-4">
            <p className="text-xs text-muted-foreground font-medium">Botões</p>
            <div className="flex flex-wrap gap-2">
              <button
                className="px-3 py-1.5 text-xs font-medium text-white transition-colors"
                style={{
                  backgroundColor: primaryColor,
                  ...radiusStyle,
                }}
              >
                Primário
              </button>
              <button
                className="px-3 py-1.5 text-xs font-medium text-white transition-colors"
                style={{
                  backgroundColor: secondaryColor,
                  ...radiusStyle,
                }}
              >
                Secundário
              </button>
              <button
                className="px-3 py-1.5 text-xs font-medium border transition-colors"
                style={{
                  borderColor: primaryColor,
                  color: primaryColor,
                  ...radiusStyle,
                }}
              >
                Outline
              </button>
            </div>
          </div>

          {/* Card Preview */}
          <div className="space-y-3 mb-4">
            <p className="text-xs text-muted-foreground font-medium">Card</p>
            <div
              className="p-3 bg-white dark:bg-slate-800 border shadow-sm"
              style={radiusStyle}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-10 h-10 bg-slate-200 dark:bg-slate-700"
                  style={radiusStyle}
                />
                <div>
                  <p className="text-xs font-medium">Produto</p>
                  <p className="text-xs text-muted-foreground">R$ 99,90</p>
                </div>
              </div>
              <button
                className="w-full px-2 py-1 text-xs font-medium text-white"
                style={{
                  backgroundColor: primaryColor,
                  ...radiusStyle,
                }}
              >
                Comprar via WhatsApp
              </button>
            </div>
          </div>

          {/* Input Preview */}
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground font-medium">Input</p>
            <input
              type="text"
              placeholder="Buscar produtos..."
              className="w-full px-3 py-1.5 text-xs border bg-white dark:bg-slate-800 focus:outline-none"
              style={{
                ...radiusStyle,
                borderColor: secondaryColor,
              }}
              readOnly
            />
          </div>
        </div>

        {/* Color Info */}
        <div className="mt-4 pt-4 border-t space-y-2">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded border"
              style={{ backgroundColor: primaryColor }}
            />
            <span className="text-xs font-mono">{primaryColor}</span>
            <span className="text-xs text-muted-foreground">Primária</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded border"
              style={{ backgroundColor: secondaryColor }}
            />
            <span className="text-xs font-mono">{secondaryColor}</span>
            <span className="text-xs text-muted-foreground">Secundária</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 border bg-slate-100 dark:bg-slate-800"
              style={radiusStyle}
            />
            <span className="text-xs font-mono">{borderRadius}</span>
            <span className="text-xs text-muted-foreground">Raio</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
