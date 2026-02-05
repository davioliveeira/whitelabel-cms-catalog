'use client';

import * as React from 'react';
import Image from 'next/image';
import { MessageCircle, ShoppingCart, Plus, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { openWhatsApp } from '@/lib/whatsapp';
import { useViewTracking } from '@/hooks/useViewTracking';
import { useCatalog } from './CatalogProvider';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    brand?: string | null;
    category?: string | null;
    description?: string | null;
    salePrice: number;
    originalPrice?: number | null;
    imageUrl?: string | null;
    isAvailable: boolean;
  };
  tenant: {
    id: string;
    whatsappPrimary?: string | null;
    whatsappSecondary?: string | null;
  };
  config?: any;
}

export function ProductCard({ product, tenant, config }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [showAddedFeedback, setShowAddedFeedback] = React.useState(false);
  const { addToCart, getItemQuantity } = useCatalog();

  // Track product view events
  const trackingRef = useViewTracking({
    tenantId: tenant.id,
    productId: product.id,
    enabled: product.isAvailable,
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const handleWhatsAppClick = () => {
    // Get WhatsApp number (primary or secondary)
    const phoneNumber = tenant.whatsappPrimary || tenant.whatsappSecondary;

    if (!phoneNumber) {
      console.error('No WhatsApp number configured for tenant');
      return;
    }

    // Open WhatsApp with product details and tracking
    openWhatsApp(
      {
        phoneNumber,
        productName: product.name,
        productPrice: product.salePrice,
      },
      {
        tenantId: tenant.id,
        productId: product.id,
      }
    );
  };

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      productName: product.name,
      productImage: product.imageUrl,
      brand: product.brand,
      category: product.category,
      price: product.salePrice,
    });

    // Show feedback
    setShowAddedFeedback(true);
    setTimeout(() => setShowAddedFeedback(false), 2000);
  };

  // Check if WhatsApp is configured
  const hasWhatsApp = Boolean(tenant.whatsappPrimary || tenant.whatsappSecondary);

  // Get config with defaults
  const cardStyle = config?.layout?.cardStyle || 'default';
  const showBrand = config?.product?.showBrand !== false;
  const showCategory = config?.product?.showCategory !== false;
  const showDescription = config?.product?.showDescription !== false;
  const imageAspectRatio = config?.product?.imageAspectRatio || '1/1';
  const cardBg = config?.colors?.cardBackground || '#FFFFFF';

  // Check if product is in cart
  const cartQuantity = getItemQuantity(product.id);

  return (
    <Card
      ref={trackingRef}
        className={cn(
        "overflow-hidden transition-all duration-300 group border-border bg-card",
        cardStyle === 'elevated' && "shadow-lg hover:shadow-xl hover:shadow-primary/10",
        cardStyle === 'minimal' && "border hover:shadow-md hover:border-primary/30",
        cardStyle === 'default' && "shadow hover:shadow-xl hover:shadow-primary/10",
        !product.isAvailable && "opacity-70"
      )}
      style={{ backgroundColor: config?.colors?.cardBackground }}
    >
      <CardContent className="p-0">
        {/* Product Image */}
        <div
          className="relative w-full overflow-hidden bg-muted"
          style={{ aspectRatio: imageAspectRatio }}
        >
          {product.imageUrl ? (
            <>
              {/* Skeleton while loading */}
              {!imageLoaded && (
                <div className="absolute inset-0 bg-muted animate-pulse" />
              )}

              {/* Actual Image */}
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                quality={85}
                className={cn(
                  "object-cover transition-all duration-300",
                  imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95",
                  !product.isAvailable && "grayscale",
                  imageLoaded && "group-hover:scale-105"
                )}
                onLoad={() => setImageLoaded(true)}
              />
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <span className="text-sm">Sem imagem</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {product.isAvailable && (
              <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white border-0" variant="default">
                Disponível
              </Badge>
            )}
            {cartQuantity > 0 && (
              <Badge className="bg-blue-600 hover:bg-blue-700 text-white border-0" variant="default">
                {cartQuantity} no carrinho
              </Badge>
            )}
          </div>

          {/* Discount Badge */}
          {product.originalPrice && product.originalPrice > product.salePrice && (
            <Badge className="absolute top-2 left-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold border-0">
              -{Math.round(((product.originalPrice - product.salePrice) / product.originalPrice) * 100)}%
            </Badge>
          )}
        </div>

        {/* Product Info */}
        <div className="p-3 md:p-4 space-y-2 md:space-y-3">
          {/* Category & Brand */}
          <div className="flex items-center gap-2 flex-wrap">
            {showCategory && product.category && (
              <Badge variant="secondary" className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground bg-secondary/50">
                {product.category}
              </Badge>
            )}
            {showBrand && product.brand && (
              <span className="text-[10px] md:text-xs text-muted-foreground font-medium">{product.brand}</span>
            )}
          </div>

          {/* Product Name */}
          <h3 className="font-semibold text-card-foreground line-clamp-2 min-h-[2.5rem] md:min-h-12 text-sm md:text-base group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Description */}
          {showDescription && product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          )}

          {/* Price Display */}
          <div className="space-y-1 pt-1">
            {product.originalPrice && product.originalPrice > product.salePrice && (
              <p className="text-sm text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </p>
            )}
            <p className="text-2xl font-bold text-primary">
              {formatPrice(product.salePrice)}
            </p>
            {product.originalPrice && product.originalPrice > product.salePrice && (
              <p className="text-xs text-emerald-500 font-medium">
                Economize {formatPrice(product.originalPrice - product.salePrice)}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              disabled={!product.isAvailable}
              className={cn(
                "flex-1 gap-2 transition-all font-semibold",
                !product.isAvailable && "opacity-50 cursor-not-allowed",
                showAddedFeedback 
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                  : "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
              )}
            >
              {showAddedFeedback ? (
                <>
                  <Check className="h-4 w-4" />
                  Adicionado
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  Adicionar
                </>
              )}
            </Button>

            {/* WhatsApp Quick Order Button */}
            {hasWhatsApp && (
              <Button
                onClick={handleWhatsAppClick}
                disabled={!product.isAvailable}
                className={cn(
                  "bg-[#25D366] hover:bg-[#128C7E] text-white hover:shadow-lg hover:shadow-[#25D366]/20",
                  !product.isAvailable && "opacity-50 cursor-not-allowed"
                )}
                size="icon"
                title="Pedir no WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
