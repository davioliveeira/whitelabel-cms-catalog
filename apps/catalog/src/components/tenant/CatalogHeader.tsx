'use client';

// =============================================================================
// Catalog Header Component
// =============================================================================
// Enhanced header with search, cart, and WhatsApp integration
// =============================================================================

import * as React from 'react';
import { Search, ShoppingCart, Users, X, Menu } from 'lucide-react';
import { useTenantData } from './TenantProvider';
import { useCatalog } from '../catalog/CatalogProvider';
import { CartDrawer } from '../catalog/CartDrawer';
import { useTheme } from '@/components/theme/ThemeProvider';

/**
 * Generate WhatsApp URL with pre-filled message.
 */
function getWhatsAppUrl(phone: string, message?: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const encodedMessage = message ? encodeURIComponent(message) : '';
  return `https://wa.me/${cleanPhone}${encodedMessage ? `?text=${encodedMessage}` : ''}`;
}

export function CatalogHeader() {
  const tenant = useTenantData();
  const { searchQuery, setSearchQuery, cart } = useCatalog();
  const { config } = useTheme(); // Theme Config
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = React.useState(false);

  if (!tenant) {
    return null;
  }

  const { header } = config;

  // WhatsApp URLs
  const whatsappUrl = tenant.whatsappPrimary
    ? getWhatsAppUrl(tenant.whatsappPrimary, `Olá! Vim do catálogo ${tenant.name}.`)
    : null;

  // Use whatsappSecondary for promotions group
  const promotionsUrl = tenant.whatsappSecondary
    ? getWhatsAppUrl(
        tenant.whatsappSecondary,
        `Olá! Gostaria de entrar no grupo de promoções.`
      )
    : whatsappUrl; // Fallback to primary if secondary not available

  // Dynamic Styles
  const containerStyle = {
    backgroundColor: header.backgroundColor,
    borderBottom: header.shadow ? 'none' : '1px solid #e2e8f0',
    boxShadow: header.shadow ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
    color: header.textColor
  };

  // Helper for dynamic inner colors (input borders etc) - using currentColor with opacity
  const elementStyle = {
    borderColor: 'currentColor', 
    opacity: 0.8
  };

  return (
    <>
      <header className="sticky top-0 z-50 transition-colors duration-300" style={containerStyle}>
        <div className="container mx-auto px-4">
          {/* Main Header Row */}
          <div className="flex items-center justify-between gap-4" style={{ height: header.height === 'large' ? '100px' : '64px' }}>
            
            {/* Logo / Store Name */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {header.style === 'minimal' && <Menu className="h-6 w-6 lg:hidden mr-2" />}
              
              {tenant.logoUrl ? (
                <img
                  src={tenant.logoUrl}
                  alt={tenant.name}
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <div
                  className="h-10 w-10 rounded flex items-center justify-center font-bold text-xl"
                  style={{ backgroundColor: config.colors.primary, color: '#fff' }}
                >
                  {tenant.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="font-semibold text-lg hidden md:block">
                {tenant.name}
              </span>
            </div>

            {/* Search Bar - Desktop */}
            {header.showSearch && (
              <div className="hidden md:flex flex-1 max-w-lg mx-auto">
                <div className="relative w-full text-inherit">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 opacity-60" />
                  <input
                    type="text"
                    placeholder="Buscar produtos, marcas, categorias..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={{
                      borderRadius: config.typography.borderRadius,
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      borderColor: 'rgba(0,0,0,0.1)',
                      color: 'inherit'
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Search Button - Mobile */}
              {header.showSearch && (
                <button
                  onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                  className="md:hidden p-2 rounded-lg hover:bg-black/5 transition-colors"
                  aria-label="Buscar"
                  style={{ color: 'inherit' }}
                >
                  <Search className="h-5 w-5" />
                </button>
              )}

              {/* Promotions Group Button */}
              {header.showPromo && promotionsUrl && (
                <a
                  href={promotionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden md:flex items-center gap-2 px-3 py-2 text-white text-sm font-medium rounded-lg transition-all hover:opacity-90 shadow-sm"
                  style={{
                    backgroundColor: '#25D366',
                    borderRadius: config.typography.borderRadius,
                  }}
                  title="Grupo de Promoções"
                >
                  <Users className="h-4 w-4" />
                  <span className="">Promoções</span>
                </a>
              )}

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-lg hover:bg-black/5 transition-colors"
                aria-label="Carrinho"
                style={{ color: 'inherit' }}
              >
                <ShoppingCart className="h-5 w-5" />
                {cart.itemCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full text-white text-xs font-bold flex items-center justify-center"
                    style={{ backgroundColor: config.colors.primary }}
                  >
                    {cart.itemCount > 9 ? '9+' : cart.itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar - Expanded */}
          {header.showSearch && isSearchExpanded && (
            <div className="md:hidden pb-3">
              <div className="relative text-inherit">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 opacity-60" />
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{
                    borderRadius: config.typography.borderRadius,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderColor: 'rgba(0,0,0,0.1)',
                    color: 'inherit'
                  }}
                  autoFocus
                />
                {searchQuery && (
                   <button
                     onClick={() => setSearchQuery('')}
                     className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
                   >
                     <X className="h-4 w-4" />
                   </button>
                 )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        tenant={tenant}
      />
    </>
  );
}

export default CatalogHeader;
