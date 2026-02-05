'use server';

import { prisma } from '@cms/database';
import { revalidatePath } from 'next/cache';
import { OrderStatus } from '@prisma/client';

export interface CreateOrderInput {
  customerName: string;
  customerPhone: string;
  sellerId: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice?: number;
  }[];
}

export async function createOrder(storeId: string, data: CreateOrderInput) {
  if (!storeId) {
    throw new Error('Store ID is required');
  }

  if (!data.items || data.items.length === 0) {
    throw new Error('Order must have at least one item');
  }

  // Calculate transaction
  try {
    const order = await prisma.$transaction(async (tx) => {
      // 1. Create the order
      const newOrder = await tx.order.create({
        data: {
          storeId,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          sellerId: data.sellerId,
          status: OrderStatus.COMPLETED,
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
        },
      });

      // 2. Decrement stock for each product
      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      return newOrder;
    });

    revalidatePath('/orders');
    revalidatePath('/products');  // Update stock visibility
    revalidatePath('/dashboard'); // Update metrics

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error('Error creating order:', error);
    return { success: false, error: 'Failed to create order' };
  }
}

export async function getRecentOrders(storeId: string) {
  if (!storeId) return [];

  const orders = await prisma.order.findMany({
    where: { storeId },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      seller: {
        select: { name: true }
      },
      items: true,
      _count: {
        select: { items: true }
      }
    }
  });

  return orders;
}
