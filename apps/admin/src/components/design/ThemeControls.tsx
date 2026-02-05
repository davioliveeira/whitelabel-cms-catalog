import * as React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ThemeConfig, ThemeConfigSchema } from '@cms/shared';
import { ColorPicker } from '@/components/ui/color-picker';
import { Loader2, Save, Check } from 'lucide-react';

// Initial default config matching the schema
const defaultConfig: ThemeConfig = {
  colors: {
    primary: '#0f172a',
    secondary: '#64748b',
    background: '#ffffff',
    cardBackground: '#ffffff',
    textPrimary: '#020817',
    textSecondary: '#64748b',
  },
  typography: {
    fontHeading: 'Inter',
    fontBody: 'Inter',
    borderRadius: '0.5rem',
    buttonStyle: 'filled',
  },
  header: {
    style: 'simple',
    backgroundColor: '#ffffff',
    textColor: '#020817',
    showSearch: true,
    showPromo: true,
    menuPosition: 'center',
    height: 'normal',
    shadow: true,
  },
  banner: {
    isActive: true,
    type: 'image',
    images: [],
    textPosition: 'center',
    overlayOpacity: 50,
    height: 'medium',
    autoplay: true,
    textColor: '#ffffff'
  }
};

export function ThemeControls({ saveRef }: { saveRef?: React.MutableRefObject<(() => Promise<void>) | undefined> }) {
  const [config, setConfig] = React.useState<ThemeConfig>(defaultConfig);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveStatus, setSaveStatus] = React.useState<'idle' | 'success' | 'error'>('idle');

  // Fetch config on mount
  React.useEffect(() => {
    async function fetchConfig() {
      try {
        const response = await fetch('/api/design/theme');
        if (response.ok) {
          const data = await response.json();
          if (data.config && Object.keys(data.config).length > 0) {
            setConfig({ ...defaultConfig, ...data.config });
          }
        }
      } catch (error) {
        console.error('Failed to fetch theme config:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchConfig();
  }, []);

  const updateConfig = (section: keyof ThemeConfig, key: string, value: any) => {
    setConfig(prev => {
      const newConfig = {
        ...prev,
        [section]: {
          ...prev[section],
          [key]: value
        }
      };

      // Send deep update to iframe
      const iframe = document.querySelector('iframe');
      if (iframe && iframe.contentWindow) {
        console.log('🚀 Sending theme update to catalog:', newConfig);
        iframe.contentWindow.postMessage({
          type: 'THEME_UPDATE',
          payload: newConfig // Send full config for simplicity or optimized partial
        }, '*');
        console.log('✅ Message sent');
      } else {
        console.warn('⚠️ Iframe not found or not ready');
      }
      return newConfig;
    });
    // Reset save status when user makes changes
    if (saveStatus === 'success') {
      setSaveStatus('idle');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    
    try {
      const response = await fetch('/api/design/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      });

      if (response.ok) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        const error = await response.json();
        console.error('Save failed:', error);
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Save error:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  // Expose handleSave to parent via ref
  React.useEffect(() => {
    if (saveRef) {
      saveRef.current = handleSave;
    }
  }, [config, saveRef]);

  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-20">
      {/* Header */}
      <div className="space-y-1">
         <h3 className="font-semibold">Estilo Visual</h3>
         <p className="text-sm text-muted-foreground">Defina a aparência da sua loja</p>
      </div>

      {/* Save Button */}
      <Button 
        onClick={handleSave} 
        disabled={isSaving}
        className="w-full"
        variant={saveStatus === 'success' ? 'default' : 'default'}
      >
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : saveStatus === 'success' ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            Salvo com Sucesso!
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Salvar Alterações
          </>
        )}
      </Button>

      {saveStatus === 'error' && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          Erro ao salvar. Tente novamente.
        </div>
      )}

      <Accordion type="single" collapsible className="w-full" defaultValue="colors">
        
        {/* CORES */}
        <AccordionItem value="colors">
          <AccordionTrigger>Cores da Marca</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
             <div className="space-y-2">
                <ColorPicker 
                  label="Cor Primária" 
                  color={config.colors.primary} 
                  onChange={(c) => updateConfig('colors', 'primary', c)} 
                />
             </div>
             <div className="space-y-2">
                <ColorPicker 
                  label="Cor Secundária" 
                  color={config.colors.secondary} 
                  onChange={(c) => updateConfig('colors', 'secondary', c)} 
                />
             </div>
             <div className="space-y-2">
                <ColorPicker 
                  label="Fundo da Página" 
                  color={config.colors.background} 
                  onChange={(c) => updateConfig('colors', 'background', c)} 
                />
             </div>
          </AccordionContent>
        </AccordionItem>

        {/* HEADER */}
        <AccordionItem value="header">
          <AccordionTrigger>Cabeçalho</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Estilo do Header</Label>
              <Select 
                value={config.header.style} 
                onValueChange={(v) => updateConfig('header', 'style', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">Simples (Logo Esquerda)</SelectItem>
                  <SelectItem value="centered">Centralizado</SelectItem>
                  <SelectItem value="minimal">Minimalista</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
                <ColorPicker 
                  label="Cor de Fundo" 
                  color={config.header.backgroundColor} 
                  onChange={(c) => updateConfig('header', 'backgroundColor', c)} 
                />
            </div>
            
            <div className="space-y-2">
                <ColorPicker 
                  label="Cor do Texto/Ícones" 
                  color={config.header.textColor} 
                  onChange={(c) => updateConfig('header', 'textColor', c)} 
                />
            </div>

            <div className="flex items-center justify-between">
              <Label>Exibir Barra de Busca</Label>
              <Switch 
                checked={config.header.showSearch}
                onCheckedChange={(c) => updateConfig('header', 'showSearch', c)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Botão "Promoções"</Label>
              <Switch 
                checked={config.header.showPromo}
                onCheckedChange={(c) => updateConfig('header', 'showPromo', c)}
              />
            </div>

             <div className="flex items-center justify-between">
              <Label>Sombra</Label>
              <Switch 
                checked={config.header.shadow}
                onCheckedChange={(c) => updateConfig('header', 'shadow', c)}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* TYPOGRAPHY */}
        <AccordionItem value="typography">
          <AccordionTrigger>Tipografia & Estilo</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
             
             {/* Fonts */}
             <div className="space-y-2">
               <Label>Fonte de Títulos</Label>
               <Select 
                 value={config.typography.fontHeading} 
                 onValueChange={(v) => updateConfig('typography', 'fontHeading', v)}
               >
                 <SelectTrigger>
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="Inter">Inter (Padrão)</SelectItem>
                   <SelectItem value="Space Grotesk">Space Grotesk</SelectItem>
                   <SelectItem value="Playfair Display">Playfair Display (Serifa)</SelectItem>
                   <SelectItem value="Montserrat">Montserrat</SelectItem>
                 </SelectContent>
               </Select>
             </div>

             <div className="space-y-2">
               <Label>Fonte de Texto</Label>
               <Select 
                 value={config.typography.fontBody} 
                 onValueChange={(v) => updateConfig('typography', 'fontBody', v)}
               >
                 <SelectTrigger>
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="Inter">Inter (Padrão)</SelectItem>
                   <SelectItem value="Lato">Lato</SelectItem>
                   <SelectItem value="Roboto">Roboto</SelectItem>
                 </SelectContent>
               </Select>
             </div>

             {/* Radius */}
             <div className="space-y-3">
               <div className="flex justify-between">
                 <Label>Arredondamento</Label>
                 <span className="text-xs text-muted-foreground">{config.typography.borderRadius}</span>
               </div>
               {/* 
                  We map slider value 0-4 to specific rem values 
                  0 -> 0rem, 1 -> 0.25rem, 2 -> 0.5rem, 3 -> 0.75rem, 4 -> 1rem, 5 -> 9999px (full)
               */}
               <Slider 
                 value={[
                    (config.typography?.borderRadius === '0rem' ? 0 :
                    config.typography?.borderRadius === '0.25rem' ? 1 :
                    config.typography?.borderRadius === '0.5rem' ? 2 :
                    config.typography?.borderRadius === '0.75rem' ? 3 :
                    config.typography?.borderRadius === '1rem' ? 4 : 2)
                 ]}
                 max={4} 
                 step={1}
                 onValueChange={(vals) => {
                    const map = ['0rem', '0.25rem', '0.5rem', '0.75rem', '1rem'];
                    updateConfig('typography', 'borderRadius', map[vals[0]]);
                 }}
               />
               <div className="flex justify-between text-[10px] text-muted-foreground px-1">
                 <span>Reto</span>
                 <span>Médio</span>
                 <span>Redondo</span>
               </div>
             </div>

             {/* Button Style */}
             <div className="space-y-2">
               <Label>Estilo dos Botões</Label>
               <Select 
                 value={config.typography.buttonStyle} 
                 onValueChange={(v) => updateConfig('typography', 'buttonStyle', v)}
               >
                 <SelectTrigger>
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="filled">Preenchido</SelectItem>
                   <SelectItem value="outlined">Borda</SelectItem>
                   <SelectItem value="ghost">Transparente</SelectItem>
                 </SelectContent>
               </Select>
             </div>

          </AccordionContent>
        </AccordionItem>

         <AccordionItem value="hero">
          <AccordionTrigger>Banner Principal</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            
            {/* Active Toggle */}
            <div className="flex items-center justify-between">
              <Label>Ativar Banner</Label>
              <Switch 
                checked={config.banner.isActive}
                onCheckedChange={(c) => updateConfig('banner', 'isActive', c)}
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select 
                value={config.banner.type} 
                onValueChange={(v) => updateConfig('banner', 'type', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Imagem Única</SelectItem>
                  <SelectItem value="carousel">Carrossel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Image URL (simplified - single input for now) */}
            <div className="space-y-2">
              <Label>URL da Imagem</Label>
              <Input 
                type="url"
                placeholder="https://exemplo.com/imagem.jpg"
                value={config.banner.images[0] || ''}
                onChange={(e) => updateConfig('banner', 'images', [e.target.value])}
              />
              <p className="text-xs text-muted-foreground">Cole a URL de uma imagem de alta qualidade</p>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label>Título</Label>
              <Input 
                placeholder="Bem-vindo à nossa loja!"
                value={config.banner.title || ''}
                onChange={(e) => updateConfig('banner', 'title', e.target.value)}
              />
            </div>

            {/* Subtitle */}
            <div className="space-y-2">
              <Label>Subtítulo</Label>
              <Input 
                placeholder="Encontre os melhores produtos"
                value={config.banner.subtitle || ''}
                onChange={(e) => updateConfig('banner', 'subtitle', e.target.value)}
              />
            </div>

            {/* CTA Text */}
            <div className="space-y-2">
              <Label>Texto do Botão</Label>
              <Input 
                placeholder="Ver Produtos"
                value={config.banner.ctaText || ''}
                onChange={(e) => updateConfig('banner', 'ctaText', e.target.value)}
              />
            </div>

            {/* Text Color */}
            <div className="space-y-2">
              <ColorPicker 
                label="Cor do Texto" 
                color={config.banner.textColor} 
                onChange={(c) => updateConfig('banner', 'textColor', c)} 
              />
            </div>

            {/* Text Position */}
            <div className="space-y-2">
              <Label>Posição do Texto</Label>
              <Select 
                value={config.banner.textPosition} 
                onValueChange={(v) => updateConfig('banner', 'textPosition', v)}
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

            {/* Overlay Opacity */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Opacidade da Sobreposição</Label>
                <span className="text-xs text-muted-foreground">{config.banner.overlayOpacity}%</span>
              </div>
              <Slider 
                value={[config.banner.overlayOpacity]}
                max={100} 
                step={5}
                onValueChange={(vals) => updateConfig('banner', 'overlayOpacity', vals[0])}
              />
            </div>

            {/* Height */}
            <div className="space-y-2">
              <Label>Altura</Label>
              <Select 
                value={config.banner.height} 
                onValueChange={(v) => updateConfig('banner', 'height', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Pequena (300px)</SelectItem>
                  <SelectItem value="medium">Média (500px)</SelectItem>
                  <SelectItem value="large">Grande (700px)</SelectItem>
                  <SelectItem value="full">Tela Cheia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Autoplay (for carousel) */}
            {config.banner.type === 'carousel' && (
              <div className="flex items-center justify-between">
                <Label>Reprodução Automática</Label>
                <Switch 
                  checked={config.banner.autoplay}
                  onCheckedChange={(c) => updateConfig('banner', 'autoplay', c)}
                />
              </div>
            )}

          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
