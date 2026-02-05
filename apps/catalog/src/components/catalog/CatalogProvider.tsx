'use client';

// =============================================================================
// Catalog Provider
// =============================================================================
// Provides catalog state (cart, search, filters) to all catalog components
// =============================================================================

import * as React from 'react';
import { useCart, Cart, CartItem } from '@/hooks/useCart';

interface CatalogContextValue {
  // Cart
  cart: Cart;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string) => number;

  // Search & Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
}

const CatalogContext = React.createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const {
    cart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemQuantity,
  } = useCart();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

  const value: CatalogContextValue = {
    cart,
    addToCart: addItem,
    removeFromCart: removeItem,
    updateCartQuantity: updateQuantity,
    clearCart,
    getItemQuantity,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
  };

  return (
    <CatalogContext.Provider value={value}>
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const context = React.useContext(CatalogContext);
  if (!context) {
    throw new Error('useCatalog must be used within CatalogProvider');
  }
  return context;
}
