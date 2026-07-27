import 'server-only';

import {and, eq, gte, sql} from 'drizzle-orm';
import {getDatabase} from '@/db/client';
import {inventory, orderItems, orders} from '@/db/schema';

export class OrderLifecycleError extends Error {
  constructor(public readonly code: 'ORDER_NOT_FOUND' | 'INVALID_ORDER_STATE' | 'RESERVATION_MISSING') {
    super(code);
  }
}

export async function confirmPaidOrder(orderId: string) {
  return getDatabase().transaction(async (tx) => {
    const [order] = await tx
      .select({id: orders.id, status: orders.status, paymentStatus: orders.paymentStatus})
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) throw new OrderLifecycleError('ORDER_NOT_FOUND');
    if (order.paymentStatus === 'paid') return {changed: false};
    if (order.status !== 'pending_payment' || order.paymentStatus !== 'pending') {
      throw new OrderLifecycleError('INVALID_ORDER_STATE');
    }

    const items = await tx
      .select({variantId: orderItems.variantId, quantity: orderItems.quantity})
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    for (const item of items) {
      const [settled] = await tx
        .update(inventory)
        .set({
          onHand: sql`${inventory.onHand} - ${item.quantity}`,
          reserved: sql`${inventory.reserved} - ${item.quantity}`,
          updatedAt: new Date()
        })
        .where(and(
          eq(inventory.variantId, item.variantId),
          gte(inventory.onHand, item.quantity),
          gte(inventory.reserved, item.quantity)
        ))
        .returning({variantId: inventory.variantId});

      if (!settled) throw new OrderLifecycleError('RESERVATION_MISSING');
    }

    await tx
      .update(orders)
      .set({status: 'confirmed', paymentStatus: 'paid', updatedAt: new Date()})
      .where(eq(orders.id, orderId));

    return {changed: true};
  });
}

export async function cancelPendingOrder(orderId: string) {
  return getDatabase().transaction(async (tx) => {
    const [order] = await tx
      .select({id: orders.id, status: orders.status, paymentStatus: orders.paymentStatus})
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) throw new OrderLifecycleError('ORDER_NOT_FOUND');
    if (order.status === 'cancelled') return {changed: false};
    if (order.status !== 'pending_payment' || order.paymentStatus !== 'pending') {
      throw new OrderLifecycleError('INVALID_ORDER_STATE');
    }

    const items = await tx
      .select({variantId: orderItems.variantId, quantity: orderItems.quantity})
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    for (const item of items) {
      const [released] = await tx
        .update(inventory)
        .set({
          reserved: sql`${inventory.reserved} - ${item.quantity}`,
          updatedAt: new Date()
        })
        .where(and(eq(inventory.variantId, item.variantId), gte(inventory.reserved, item.quantity)))
        .returning({variantId: inventory.variantId});

      if (!released) throw new OrderLifecycleError('RESERVATION_MISSING');
    }

    await tx
      .update(orders)
      .set({status: 'cancelled', updatedAt: new Date()})
      .where(eq(orders.id, orderId));

    return {changed: true};
  });
}
