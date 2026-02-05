'use client';

import * as React from 'react';
import { CatalogPreview } from './CatalogPreview';
import { ThemeControls } from './ThemeControls';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Globe, Smartphone, Monitor, Loader2, Check } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export function ThemePlayground() {
  const [device, setDevice] = React.useState<'desktop' | 'mobile'>('desktop');
  const [isPublishing, setIsPublishing] = React.useState(false);
  const [publishStatus, setPublishStatus] = React.useState<'idle' | 'success' | 'error'>('idle');
  const [storeSlug, setStoreSlug] = React.useState<string | null>(null);
  const { data: session } = useSession();
  
  // Ref to trigger save from child component
  const saveRef = React.useRef<() => Promise<void>>();

  // Fetch store slug
  React.useEffect(() => {
    async function fetchStoreSlug() {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          setStoreSlug(data.slug);
        }
      } catch (error) {
        console.error('Failed to fetch store slug:', error);
      }
    }
    
    if (session?.user) {
      fetchStoreSlug();
    }
  }, [session]);

  const handlePublish = async () => {
    if (!saveRef.current) return;
    
    setIsPublishing(true);
    setPublishStatus('idle');
    
    try {
      await saveRef.current();
      setPublishStatus('success');
      setTimeout(() => setPublishStatus('idle'), 3000);
    } catch (error) {
      console.error('Publish error:', error);
      setPublishStatus('error');
    } finally {
      setIsPublishing(false);
    }
  };
  
  const catalogBaseUrl = process.env.NEXT_PUBLIC_CATALOG_URL || 'http://localhost:8001';
  const catalogUrl = storeSlug ? `${catalogBaseUrl}/${storeSlug}` : null;
  
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b bg-background px-4 py-3">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
             <Link href="/dashboard" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
             </Link>
          </Button>
          <div className="h-6 w-px bg-border/50" />
          <h1 className="text-lg font-bold tracking-tight">Personalizar Loja</h1>
        </div>

        <div className="flex items-center gap-2">
           <div className="flex items-center border rounded-md mr-4">
              <Button 
                variant={device === 'desktop' ? 'secondary' : 'ghost'} 
                size="icon" 
                className="h-8 w-8 rounded-none"
                onClick={() => setDevice('desktop')}
              >
                  <Monitor className="h-4 w-4" />
              </Button>
              <Button 
                 variant={device === 'mobile' ? 'secondary' : 'ghost'} 
                 size="icon" 
                 className="h-8 w-8 rounded-none"
                 onClick={() => setDevice('mobile')}
              >
                  <Smartphone className="h-4 w-4" />
              </Button>
           </div>
           
           {catalogUrl && (
             <Button variant="outline" className="gap-2" asChild>
               <a href={catalogUrl} target="_blank" rel="noopener noreferrer">
                 <Globe className="h-4 w-4" />
                 Ver Loja
               </a>
             </Button>
           )}
           
           <Button 
             className="gap-2" 
             onClick={handlePublish}
             disabled={isPublishing}
           >
             {isPublishing ? (
               <>
                 <Loader2 className="h-4 w-4 animate-spin" />
                 Publicando...
               </>
             ) : publishStatus === 'success' ? (
               <>
                 <Check className="h-4 w-4" />
                 Publicado!
               </>
             ) : (
               <>
                 <Save className="h-4 w-4" />
                 Publicar
               </>
             )}
           </Button>
        </div>
      </div>

      {/* Split Screen */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Editor Panel (Top/Left) */}
        <div className="w-full lg:w-[350px] h-[40vh] lg:h-auto border-b lg:border-r lg:border-b-0 overflow-y-auto bg-card shrink-0">
           <ThemeControls saveRef={saveRef} />
        </div>

        {/* Preview Panel (Bottom/Right) */}
        <div className="flex-1 bg-muted/20 flex items-center justify-center p-4 lg:p-8 overflow-hidden relative min-h-0">
            <div className="absolute inset-0 bg-grid-black/[0.05] dark:bg-grid-white/[0.05]" />
            <div className="w-full h-full overflow-hidden flex flex-col">
               <CatalogPreview device={device} />
            </div>
        </div>
      </div>
    </div>
  );
}
