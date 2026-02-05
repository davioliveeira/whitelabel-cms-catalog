'use client';

// =============================================================================
// Shopping Cart Hook
// =============================================================================
// Manages shopping cart state with localStorage persistence
// =============================================================================

import { useState, useEffect } from 'react';

export interface CartItem {
  productId: string;
  productName: string;
  productImage?: string | null;
  brand?: string | null;
  category?: string | null;
  price: number;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

const CART_STORAGE_KEY = 'catalog_cart';

export function useCart() {
  const [cart, setCart] = useState<Cart>({
    items: [],
    total: 0,
    itemCount: 0,
  });

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsedCart = JSON.parse(stored) as Cart;
        setCart(parsedCart);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }, [cart]);

  // Calculate totals
  const calculateTotals = (items: CartItem[]): { total: number; itemCount: number } => {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    return { total, itemCount };
  };

  // Add item to cart
  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.items.findIndex(
        (i) => i.productId === item.productId
      );

      let newItems: CartItem[];

      if (existingItemIndex >= 0) {
        // Increment quantity if item already exists
        newItems = [...prevCart.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + 1,
        };
      } else {
        // Add new item with quantity 1
        newItems = [...prevCart.items, { ...item, quantity: 1 }];
      }

      const { total, itemCount } = calculateTotals(newItems);

      return {
        items: newItems,
        total,
        itemCount,
      };
    });
  };

  // Remove item from cart
  const removeItem = (productId: string) => {
    setCart((prevCart) => {
      const newItems = prevCart.items.filter((item) => item.productId !== productId);
      const { total, itemCount } = calculateTotals(newItems);

      return {
        items: newItems,
        total,
        itemCount,
      };
    });
  };

  // Update item quantity
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setCart((prevCart) => {
      const newItems = prevCart.items.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      );
      const { total, itemCount } = calculateTotals(newItems);

      return {
        items: newItems,
        total,
        itemCount,
      };
    });
  };

  // Clear cart
  const clearCart = () => {
    setCart({
      items: [],
      total: 0,
      itemCount: 0,
    });
  };

  // Get item quantity
  const getItemQuantity = (productId: string): number => {
    const item = cart.items.find((i) => i.productId === productId);
    return item?.quantity || 0;
  };

  return {
    cart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemQuantity,
  };
}
