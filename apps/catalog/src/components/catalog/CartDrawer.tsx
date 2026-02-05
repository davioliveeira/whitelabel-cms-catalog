'use client';

// =============================================================================
// Cart Drawer Component
// =============================================================================
// Slide-out drawer showing cart items with checkout via WhatsApp
// =============================================================================

import * as React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCatalog } from './CatalogProvider';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: {
    name: string;
    whatsappPrimary?: string | null;
    whatsappSecondary?: string | null;
  };
}

/**
 * Format price in BRL
 */
function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price);
}

/**
 * Generate WhatsApp checkout message
 */
function generateCheckoutMessage(
  tenantName: string,
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>,
  total: number
): string {
  const lines: string[] = [];

  lines.push(`*NOVO PEDIDO*`);
  lines.push(`${tenantName}`);
  lines.push(``);
  lines.push(`*Itens:*`);

  items.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    lines.push(``);
    lines.push(`${index + 1}. ${item.productName}`);
    lines.push(`Qtd: ${item.quantity} x ${formatPrice(item.price)}`);
    lines.push(`Subtotal: ${formatPrice(itemTotal)}`);
  });

  lines.push(``);
  lines.push(`---`);
  lines.push(`*TOTAL: ${formatPrice(total)}*`);
  lines.push(``);
  lines.push(`Gostaria de finalizar este pedido.`);

  return lines.join('\n');
}

export function CartDrawer({ isOpen, onClose, tenant }: CartDrawerProps) {
  const { cart, removeFromCart, updateCartQuantity, clearCart } = useCatalog();

  // Handle checkout
  const handleCheckout = () => {
    if (cart.items.length === 0) return;

    const phone = tenant.whatsappPrimary || tenant.whatsappSecondary;
    if (!phone) {
      alert('WhatsApp não configurado para este lojista.');
      return;
    }

    const message = generateCheckoutMessage(
      tenant.name,
      cart.items.map((item) => ({
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
      })),
      cart.total
    );

    const cleanPhone = phone.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

    // Open WhatsApp
    window.open(whatsappUrl, '_blank');

    // Clear cart after checkout
    clearCart();
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Seu Carrinho</h2>
              {cart.itemCount > 0 && (
                <span className="text-sm text-gray-500">({cart.itemCount})</span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cart.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">Seu carrinho está vazio</p>
                <p className="text-sm text-gray-400 mt-2">
                  Adicione produtos para continuar
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    {/* Product Image */}
                    {item.productImage ? (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-20 h-20 object-cover rounded"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
                        <ShoppingBag className="h-8 w-8 text-gray-400" />
                      </div>
                    )}

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm line-clamp-2">
                        {item.productName}
                      </h3>
                      {item.brand && (
                        <p className="text-xs text-gray-500 mt-1">{item.brand}</p>
                      )}
                      <p className="text-sm font-semibold mt-2">
                        {formatPrice(item.price)}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() =>
                            updateCartQuantity(item.productId, item.quantity - 1)
                          }
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateCartQuantity(item.productId, item.quantity + 1)
                          }
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="ml-auto p-1 hover:bg-red-100 text-red-600 rounded transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer with Total and Checkout */}
          {cart.items.length > 0 && (
            <div className="border-t p-4 space-y-3">
              {/* Clear Cart Button */}
              <button
                onClick={clearCart}
                className="w-full py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Limpar Carrinho
              </button>

              {/* Total */}
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>{formatPrice(cart.total)}</span>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full py-3 text-white font-medium rounded-lg transition-all hover:opacity-90"
                style={{ backgroundColor: '#25D366' }}
              >
                Finalizar Pedido via WhatsApp
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
