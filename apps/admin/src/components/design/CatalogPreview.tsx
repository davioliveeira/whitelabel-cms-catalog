'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface CatalogPreviewProps {
  device: 'desktop' | 'mobile';
}

export function CatalogPreview({ device }: CatalogPreviewProps) {
  const [loading, setLoading] = React.useState(true);
  const [storeSlug, setStoreSlug] = React.useState<string | null>(null);
  const { data: session } = useSession();
  
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
  
  // URL to the catalog with dynamic slug
  const catalogBaseUrl = process.env.NEXT_PUBLIC_CATALOG_URL || 'http://localhost:8001';
  const previewUrl = storeSlug ? `${catalogBaseUrl}/${storeSlug}` : null;

  if (!previewUrl) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Carregando loja...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "bg-background shadow-2xl transition-all duration-300 relative border-4 border-black dark:border-white overflow-hidden",
        device === 'mobile' ? "w-[375px] h-[720px] rounded-[3rem] border-[8px]" : "w-full h-full rounded-md"
      )}
    >
        {loading && (
             <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
                 <div className="flex flex-col items-center gap-2">
                     <Loader2 className="h-8 w-8 animate-spin text-primary" />
                     <p className="text-sm font-medium text-muted-foreground">Carregando preview...</p>
                 </div>
             </div>
        )}
        
        <iframe
            src={previewUrl}
            className="w-full h-full border-0"
            onLoad={() => setLoading(false)}
            title="Catalog Preview"
        />
    </div>
  );
}
