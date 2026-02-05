// =============================================================================
// Catalog Customization Page
// =============================================================================
// Visual site builder for customizing the catalog layout and appearance
// =============================================================================

'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Palette,
  Layout,
  Type,
  Image as ImageIcon,
  Save,
  Eye,
  Settings2,
  Columns,
  Grid3x3,
  List,
  Smartphone,
  Monitor,
  Tablet,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/lib/hooks/useAuth';

// =============================================================================
// Types & Templates
// =============================================================================

interface CatalogConfig {
  layout: {
    type: 'grid' | 'list';
    columns: 2 | 3 | 4;
    gap: number;
    cardStyle: 'default' | 'minimal' | 'elevated';
  };
  colors: {
    primary: string;
    secondary: string;
    background: string;
    cardBackground: string;
  };
  typography: {
    fontFamily: string;
    headingSize: string;
    bodySize: string;
  };
  header: {
    showLogo: boolean;
    logoPosition: 'left' | 'center' | 'right';
    showName: boolean;
    height: number;
    style: 'gradient' | 'solid' | 'minimal' | 'classic';
  };
  product: {
    showBrand: boolean;
    showCategory: boolean;
    showDescription: boolean;
    priceSize: string;
    imageAspectRatio: string;
  };
}

const defaultConfig: CatalogConfig = {
  layout: { type: 'grid', columns: 3, gap: 6, cardStyle: 'default' },
  colors: { primary: '#3B82F6', secondary: '#8B5CF6', background: '#F8FAFC', cardBackground: '#FFFFFF' },
  typography: { fontFamily: 'system', headingSize: '1.5rem', bodySize: '1rem' },
  header: { showLogo: true, logoPosition: 'center', showName: true, height: 80, style: 'gradient' },
  product: { showBrand: true, showCategory: true, showDescription: true, priceSize: '1.25rem', imageAspectRatio: '1/1' },
};

// Templates Pré-prontos
const TEMPLATES = {
  modern: {
    name: 'Moderno',
    description: 'Design clean e minimalista',
    config: {
      ...defaultConfig,
      layout: { type: 'grid', columns: 3, gap: 8, cardStyle: 'minimal' },
      colors: { primary: '#000000', secondary: '#3B82F6', background: '#FFFFFF', cardBackground: '#F9FAFB' },
      header: { showLogo: true, logoPosition: 'left', showName: true, height: 70, style: 'minimal' },
      product: { showBrand: false, showCategory: false, showDescription: false, priceSize: '1.5rem', imageAspectRatio: '1/1' },
    },
  },
  classic: {
    name: 'Clássico',
    description: 'Tradicional e elegante',
    config: {
      ...defaultConfig,
      layout: { type: 'grid', columns: 4, gap: 6, cardStyle: 'default' },
      colors: { primary: '#1E3A8A', secondary: '#991B1B', background: '#F8FAFC', cardBackground: '#FFFFFF' },
      header: { showLogo: true, logoPosition: 'center', showName: true, height: 100, style: 'classic' },
      product: { showBrand: true, showCategory: true, showDescription: true, priceSize: '1.25rem', imageAspectRatio: '4/3' },
    },
  },
  vibrant: {
    name: 'Vibrante',
    description: 'Cores vivas e chamativas',
    config: {
      ...defaultConfig,
      layout: { type: 'grid', columns: 3, gap: 6, cardStyle: 'elevated' },
      colors: { primary: '#EC4899', secondary: '#F59E0B', background: '#FEF3C7', cardBackground: '#FFFFFF' },
      header: { showLogo: true, logoPosition: 'center', showName: true, height: 90, style: 'gradient' },
      product: { showBrand: true, showCategory: true, showDescription: false, priceSize: '1.5rem', imageAspectRatio: '1/1' },
    },
  },
  minimal: {
    name: 'Minimalista',
    description: 'Simples e direto',
    config: {
      ...defaultConfig,
      layout: { type: 'grid', columns: 2, gap: 12, cardStyle: 'minimal' },
      colors: { primary: '#64748B', secondary: '#475569', background: '#FFFFFF', cardBackground: '#FFFFFF' },
      header: { showLogo: false, logoPosition: 'center', showName: true, height: 60, style: 'solid' },
      product: { showBrand: false, showCategory: false, showDescription: true, priceSize: '1.25rem', imageAspectRatio: '3/4' },
    },
  },
};

// =============================================================================
// Customization Page Component
// =============================================================================

export default function CustomizePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [config, setConfig] = React.useState<CatalogConfig>(defaultConfig);
  const [previewDevice, setPreviewDevice] = React.useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Fetch current settings
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await fetch('/api/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      return response.json();
    },
  });

  // Initialize config with saved settings
  React.useEffect(() => {
    if (settings?.catalogConfig) {
      setConfig({ ...defaultConfig, ...settings.catalogConfig });
    } else if (settings) {
      setConfig((prev) => ({
        ...prev,
        colors: {
          ...prev.colors,
          primary: settings.primaryColor || prev.colors.primary,
          secondary: settings.secondaryColor || prev.colors.secondary,
        },
      }));
    }
  }, [settings]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: CatalogConfig) => {
      const response = await fetch('/api/customize', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ catalogConfig: data }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save customization');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Personalização salva com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setSidebarOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao salvar personalização');
    },
  });

  const handleSave = () => {
    saveMutation.mutate(config);
  };

  const handlePreview = () => {
    if (settings?.slug) {
      window.open(`/${settings.slug}`, '_blank');
    }
  };

  const applyTemplate = (templateKey: keyof typeof TEMPLATES) => {
    setConfig(TEMPLATES[templateKey].config as CatalogConfig);
    toast.success(`Template "${TEMPLATES[templateKey].name}" aplicado!`);
  };

  const getPreviewWidth = () => {
    switch (previewDevice) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      default: return '100%';
    }
  };

  const renderHeaderPreview = () => {
    const headerStyle = config.header.style;

    const baseClasses = "border-b";
    const styleClasses = {
      gradient: "bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white",
      solid: "bg-[var(--primary)] text-white",
      minimal: "bg-white border-b-2",
      classic: "bg-white shadow-md",
    }[headerStyle] || "";

    return (
      <div className={`${baseClasses} ${styleClasses}`} style={{ height: `${config.header.height}px` }}>
        <div className={`h-full flex items-center px-4 ${config.header.logoPosition === 'center' ? 'justify-center' : config.header.logoPosition === 'right' ? 'justify-end' : 'justify-start'}`}>
          {config.header.showLogo && (
            <ImageIcon className={`h-8 w-8 ${headerStyle === 'minimal' || headerStyle === 'classic' ? 'text-slate-400' : ''}`} />
          )}
          {config.header.showName && (
            <h1
              className={`font-bold ml-3 ${headerStyle === 'minimal' || headerStyle === 'classic' ? 'text-slate-900' : ''}`}
              style={{ fontSize: config.typography.headingSize }}
            >
              {settings?.name || 'Minha Loja'}
            </h1>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 px-4 lg:px-6 py-3 lg:py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <Palette className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600" />
          <div>
            <h1 className="text-base lg:text-xl font-bold">Personalizar Catálogo</h1>
            <p className="text-xs lg:text-sm text-slate-600 hidden sm:block">
              Customize o visual da sua loja
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Device Preview Selector - Hidden on mobile */}
          <div className="hidden md:flex gap-1 bg-slate-100 rounded-lg p-1">
            <Button
              variant={previewDevice === 'mobile' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPreviewDevice('mobile')}
            >
              <Smartphone className="h-4 w-4" />
            </Button>
            <Button
              variant={previewDevice === 'tablet' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPreviewDevice('tablet')}
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button
              variant={previewDevice === 'desktop' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPreviewDevice('desktop')}
            >
              <Monitor className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="outline" size="sm" onClick={handlePreview} className="hidden sm:flex">
            <Eye className="h-4 w-4 lg:mr-2" />
            <span className="hidden lg:inline">Preview ao Vivo</span>
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saveMutation.isPending}>
            <Save className="h-4 w-4 lg:mr-2" />
            <span className="hidden lg:inline">{saveMutation.isPending ? 'Salvando...' : 'Salvar'}</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar - Settings */}
        <div
          className={`
            fixed lg:relative inset-y-0 left-0 z-50
            w-80 bg-white border-r border-slate-200 overflow-y-auto
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            top-[57px] lg:top-0
          `}
        >
          {/* Templates Section */}
          <div className="p-4 border-b">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              Templates Prontos
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(TEMPLATES).map(([key, template]) => (
                <button
                  key={key}
                  onClick={() => applyTemplate(key as keyof typeof TEMPLATES)}
                  className="p-3 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                >
                  <p className="font-medium text-sm">{template.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{template.description}</p>
                </button>
              ))}
            </div>
          </div>

          <Tabs defaultValue="layout" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0">
              <TabsTrigger value="layout" className="gap-2 text-xs lg:text-sm">
                <Layout className="h-4 w-4" />
                Layout
              </TabsTrigger>
              <TabsTrigger value="colors" className="gap-2 text-xs lg:text-sm">
                <Palette className="h-4 w-4" />
                Cores
              </TabsTrigger>
              <TabsTrigger value="header" className="gap-2 text-xs lg:text-sm">
                <Settings2 className="h-4 w-4" />
                Header
              </TabsTrigger>
              <TabsTrigger value="product" className="gap-2 text-xs lg:text-sm">
                <ImageIcon className="h-4 w-4" />
                Produto
              </TabsTrigger>
            </TabsList>

            {/* Layout Tab */}
            <TabsContent value="layout" className="p-4 lg:p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Tipo de Layout</Label>
                  <Select
                    value={config.layout.type}
                    onValueChange={(value: 'grid' | 'list') =>
                      setConfig({ ...config, layout: { ...config.layout, type: value } })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">
                        <div className="flex items-center gap-2">
                          <Grid3x3 className="h-4 w-4" />
                          Grade
                        </div>
                      </SelectItem>
                      <SelectItem value="list">
                        <div className="flex items-center gap-2">
                          <List className="h-4 w-4" />
                          Lista
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {config.layout.type === 'grid' && (
                  <div>
                    <Label>Colunas ({config.layout.columns})</Label>
                    <Slider
                      value={[config.layout.columns]}
                      onValueChange={([value]) =>
                        setConfig({
                          ...config,
                          layout: { ...config.layout, columns: value as 2 | 3 | 4 },
                        })
                      }
                      min={2}
                      max={4}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                )}

                <div>
                  <Label>Espaçamento ({config.layout.gap})</Label>
                  <Slider
                    value={[config.layout.gap]}
                    onValueChange={([value]) =>
                      setConfig({ ...config, layout: { ...config.layout, gap: value } })
                    }
                    min={2}
                    max={12}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Estilo do Card</Label>
                  <Select
                    value={config.layout.cardStyle}
                    onValueChange={(value: any) =>
                      setConfig({ ...config, layout: { ...config.layout, cardStyle: value } })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Padrão</SelectItem>
                      <SelectItem value="minimal">Minimalista</SelectItem>
                      <SelectItem value="elevated">Elevado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Colors Tab */}
            <TabsContent value="colors" className="p-4 lg:p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Cor Primária</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="color"
                      value={config.colors.primary}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          colors: { ...config.colors, primary: e.target.value },
                        })
                      }
                      className="w-20 h-10"
                    />
                    <Input
                      value={config.colors.primary}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          colors: { ...config.colors, primary: e.target.value },
                        })
                      }
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>

                <div>
                  <Label>Cor Secundária</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="color"
                      value={config.colors.secondary}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          colors: { ...config.colors, secondary: e.target.value },
                        })
                      }
                      className="w-20 h-10"
                    />
                    <Input
                      value={config.colors.secondary}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          colors: { ...config.colors, secondary: e.target.value },
                        })
                      }
                      placeholder="#8B5CF6"
                    />
                  </div>
                </div>

                <div>
                  <Label>Fundo da Página</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="color"
                      value={config.colors.background}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          colors: { ...config.colors, background: e.target.value },
                        })
                      }
                      className="w-20 h-10"
                    />
                    <Input
                      value={config.colors.background}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          colors: { ...config.colors, background: e.target.value },
                        })
                      }
                      placeholder="#F8FAFC"
                    />
                  </div>
                </div>

                <div>
                  <Label>Fundo dos Cards</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="color"
                      value={config.colors.cardBackground}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          colors: { ...config.colors, cardBackground: e.target.value },
                        })
                      }
                      className="w-20 h-10"
                    />
                    <Input
                      value={config.colors.cardBackground}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          colors: { ...config.colors, cardBackground: e.target.value },
                        })
                      }
                      placeholder="#FFFFFF"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Header Tab */}
            <TabsContent value="header" className="p-4 lg:p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Estilo do Header</Label>
                  <Select
                    value={config.header.style}
                    onValueChange={(value: any) =>
                      setConfig({ ...config, header: { ...config.header, style: value } })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gradient">Gradiente</SelectItem>
                      <SelectItem value="solid">Sólido</SelectItem>
                      <SelectItem value="minimal">Minimalista</SelectItem>
                      <SelectItem value="classic">Clássico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Mostrar Logo</Label>
                  <input
                    type="checkbox"
                    checked={config.header.showLogo}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        header: { ...config.header, showLogo: e.target.checked },
                      })
                    }
                    className="h-4 w-4"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Mostrar Nome</Label>
                  <input
                    type="checkbox"
                    checked={config.header.showName}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        header: { ...config.header, showName: e.target.checked },
                      })
                    }
                    className="h-4 w-4"
                  />
                </div>

                <div>
                  <Label>Posição do Logo</Label>
                  <Select
                    value={config.header.logoPosition}
                    onValueChange={(value: any) =>
                      setConfig({
                        ...config,
                        header: { ...config.header, logoPosition: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Esquerda</SelectItem>
                      <SelectItem value="center">Centro</SelectItem>
                      <SelectItem value="right">Direita</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Altura ({config.header.height}px)</Label>
                  <Slider
                    value={[config.header.height]}
                    onValueChange={([value]) =>
                      setConfig({ ...config, header: { ...config.header, height: value } })
                    }
                    min={60}
                    max={150}
                    step={10}
                    className="mt-2"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Product Tab */}
            <TabsContent value="product" className="p-4 lg:p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Mostrar Marca</Label>
                  <input
                    type="checkbox"
                    checked={config.product.showBrand}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        product: { ...config.product, showBrand: e.target.checked },
                      })
                    }
                    className="h-4 w-4"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Mostrar Categoria</Label>
                  <input
                    type="checkbox"
                    checked={config.product.showCategory}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        product: { ...config.product, showCategory: e.target.checked },
                      })
                    }
                    className="h-4 w-4"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Mostrar Descrição</Label>
                  <input
                    type="checkbox"
                    checked={config.product.showDescription}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        product: { ...config.product, showDescription: e.target.checked },
                      })
                    }
                    className="h-4 w-4"
                  />
                </div>

                <div>
                  <Label>Aspect Ratio da Imagem</Label>
                  <Select
                    value={config.product.imageAspectRatio}
                    onValueChange={(value) =>
                      setConfig({
                        ...config,
                        product: { ...config.product, imageAspectRatio: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1/1">Quadrado (1:1)</SelectItem>
                      <SelectItem value="4/3">Paisagem (4:3)</SelectItem>
                      <SelectItem value="3/4">Retrato (3:4)</SelectItem>
                      <SelectItem value="16/9">Widescreen (16:9)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Preview Area */}
        <div className="flex-1 bg-slate-100 p-2 lg:p-8 overflow-y-auto">
          <div className="mx-auto transition-all duration-300" style={{ maxWidth: getPreviewWidth() }}>
            <Card className="shadow-2xl">
              <CardContent className="p-0">
                {/* Preview Notice */}
                <div className="bg-yellow-50 border-b border-yellow-200 px-3 py-2 text-center">
                  <p className="text-xs lg:text-sm text-yellow-800">
                    📱 Preview Visual - Salve para aplicar no catálogo real
                  </p>
                </div>

                {/* Simulated Catalog Preview */}
                <div
                  className="min-h-screen"
                  style={{
                    backgroundColor: config.colors.background,
                    '--primary': config.colors.primary,
                    '--secondary': config.colors.secondary,
                  } as React.CSSProperties}
                >
                  {/* Header Preview */}
                  {renderHeaderPreview()}

                  {/* Products Preview */}
                  <div className="p-4 lg:p-6">
                    <div
                      className={config.layout.type === 'grid' ? 'grid' : 'flex flex-col'}
                      style={{
                        gridTemplateColumns: config.layout.type === 'grid'
                          ? `repeat(${config.layout.columns}, 1fr)`
                          : undefined,
                        gap: `${config.layout.gap * 0.25}rem`,
                      }}
                    >
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                          key={i}
                          className={`rounded-lg overflow-hidden ${
                            config.layout.cardStyle === 'elevated'
                              ? 'shadow-lg'
                              : config.layout.cardStyle === 'minimal'
                              ? 'border'
                              : 'shadow'
                          }`}
                          style={{ backgroundColor: config.colors.cardBackground }}
                        >
                          <div className="bg-slate-200" style={{ aspectRatio: config.product.imageAspectRatio }} />
                          <div className="p-3 lg:p-4 space-y-2">
                            {config.product.showBrand && <p className="text-xs text-slate-500">Marca</p>}
                            {config.product.showCategory && (
                              <span className="text-xs px-2 py-1 bg-slate-100 rounded">Categoria</span>
                            )}
                            <h3
                              className="font-semibold"
                              style={{ fontSize: config.typography.headingSize }}
                            >
                              Produto {i}
                            </h3>
                            {config.product.showDescription && (
                              <p className="text-xs lg:text-sm text-slate-600">Descrição do produto...</p>
                            )}
                            <div className="flex items-center gap-2">
                              <span
                                className="font-bold"
                                style={{
                                  color: config.colors.primary,
                                  fontSize: config.product.priceSize,
                                }}
                              >
                                R$ 99,90
                              </span>
                            </div>
                            <button
                              className="w-full py-2 rounded font-semibold text-white text-sm"
                              style={{ backgroundColor: config.colors.primary }}
                            >
                              WhatsApp
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
