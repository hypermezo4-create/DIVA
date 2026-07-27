import 'server-only';

import {and, eq, lte} from 'drizzle-orm';
import {getDatabase} from '@/db/client';
import {inventory, orders, products, productVariants} from '@/db/schema';
import {cancelPendingOrder} from '@/features/orders/lifecycle';

export class AdminMutationError extends Error {
  constructor(public readonly code: 'NOT_FOUND' | 'INVALID_STATE' | 'INVALID_STOCK' | 'INVALID_PRICE') {
    super(code);
  }
}

export async function updateAdminProduct({
  productId,
  status,
  newArrival
}: {
  productId: string;
  status?: 'draft' | 'active' | 'archived';
  newArrival?: boolean;
}) {
  const patch: {status?: 'draft' | 'active' | 'archived'; newArrival?: boolean; updatedAt: Date} = {updatedAt: new Date()};
  if (status !== undefined) patch.status = status;
  if (newArrival !== undefined) patch.newArrival = newArrival;

  const [updated] = await getDatabase()
    .update(products)
    .set(patch)
    .where(eq(products.id, productId))
    .returning({id: products.id, status: products.status, newArrival: products.newArrival});

  if (!updated) throw new AdminMutationError('NOT_FOUND');
  return updated;
}

export async function updateAdminVariant({
  variantId,
  priceMinor,
  compareAtMinor,
  active
}: {
  variantId: string;
  priceMinor?: number | null;
  compareAtMinor?: number | null;
  active?: boolean;
}) {
  const db = getDatabase();
  const [current] = await db
    .select({
      priceMinor: productVariants.priceMinor,
      compareAtMinor: productVariants.compareAtMinor,
      active: productVariants.active
    })
    .from(productVariants)
    .where(eq(productVariants.id, variantId))
    .limit(1);
  if (!current) throw new AdminMutationError('NOT_FOUND');

  const nextPrice = priceMinor === undefined ? current.priceMinor : priceMinor;
  const nextCompareAt = compareAtMinor === undefined ? current.compareAtMinor : compareAtMinor;
  if (nextPrice !== null && nextPrice < 0) throw new AdminMutationError('INVALID_PRICE');
  if (nextCompareAt !== null && nextCompareAt < 0) throw new AdminMutationError('INVALID_PRICE');
  if (nextCompareAt !== null && nextPrice !== null && nextCompareAt <= nextPrice) {
    throw new AdminMutationError('INVALID_PRICE');
  }

  const [updated] = await db
    .update(productVariants)
    .set({
      priceMinor: nextPrice,
      compareAtMinor: nextCompareAt,
      active: active === undefined ? current.active : active,
      updatedAt: new Date()
    })
    .where(eq(productVariants.id, variantId))
    .returning({id: productVariants.id});
  if (!updated) throw new AdminMutationError('NOT_FOUND');
  return updated;
}

export async function updateAdminInventory({variantId, onHand}: {variantId: string; onHand: number}) {
  if (!Number.isInteger(onHand) || onHand < 0) throw new AdminMutationError('INVALID_STOCK');

  const [updated] = await getDatabase()
    .update(inventory)
    .set({onHand, updatedAt: new Date()})
    .where(and(eq(inventory.variantId, variantId), lte(inventory.reserved, onHand)))
    .returning({variantId: inventory.variantId, onHand: inventory.onHand, reserved: inventory.reserved});

  if (!updated) {
    const [existing] = await getDatabase()
      .select({variantId: inventory.variantId})
      .from(inventory)
      .where(eq(inventory.variantId, variantId))
      .limit(1);
    throw new AdminMutationError(existing ? 'INVALID_STOCK' : 'NOT_FOUND');
  }
  return updated;
}

const nextOrderStatus = {
  confirmed: 'processing',
  processing: 'shipped',
  shipped: 'delivered'
} as const;

export async function transitionAdminOrder(orderId: string, target: 'cancelled' | 'processing' | 'shipped' | 'delivered') {
  const db = getDatabase();
  const [order] = await db
    .select({status: orders.status, paymentStatus: orders.paymentStatus})
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);
  if (!order) throw new AdminMutationError('NOT_FOUND');

  if (target === 'cancelled') {
    if (order.status !== 'pending_payment' || order.paymentStatus !== 'pending') {
      throw new AdminMutationError('INVALID_STATE');
    }
    await cancelPendingOrder(orderId);
    return {status: 'cancelled' as const};
  }

  if (order.paymentStatus !== 'paid') throw new AdminMutationError('INVALID_STATE');
  const expected = nextOrderStatus[order.status as keyof typeof nextOrderStatus];
  if (expected !== target) throw new AdminMutationError('INVALID_STATE');

  const [updated] = await db
    .update(orders)
    .set({status: target, updatedAt: new Date()})
    .where(and(eq(orders.id, orderId), eq(orders.status, order.status)))
    .returning({status: orders.status});
  if (!updated) throw new AdminMutationError('INVALID_STATE');
  return updated;
}
