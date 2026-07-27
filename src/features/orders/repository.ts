import 'server-only';

import {and, asc, desc, eq} from 'drizzle-orm';
import {getDatabase} from '@/db/client';
import {orderItems, orders} from '@/db/schema';

async function listOrderItems(orderId: string) {
  return getDatabase()
    .select({
      id: orderItems.id,
      productName: orderItems.productName,
      sizeLabel: orderItems.sizeLabel,
      colorLabel: orderItems.colorLabel,
      unitPriceMinor: orderItems.unitPriceMinor,
      quantity: orderItems.quantity,
      lineTotalMinor: orderItems.lineTotalMinor
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId))
    .orderBy(asc(orderItems.productName));
}

export async function findOrderConfirmation(number: string, confirmationToken: string) {
  const [order] = await getDatabase()
    .select({
      id: orders.id,
      number: orders.number,
      status: orders.status,
      paymentStatus: orders.paymentStatus,
      shippingMethod: orders.shippingMethod,
      currency: orders.currency,
      subtotalMinor: orders.subtotalMinor,
      shippingMinor: orders.shippingMinor,
      totalMinor: orders.totalMinor,
      createdAt: orders.createdAt
    })
    .from(orders)
    .where(and(eq(orders.number, number), eq(orders.confirmationToken, confirmationToken)))
    .limit(1);

  if (!order) return null;
  const items = await listOrderItems(order.id);
  return {...order, items};
}

export async function listOrdersForUser(userId: string) {
  return getDatabase()
    .select({
      id: orders.id,
      number: orders.number,
      status: orders.status,
      paymentStatus: orders.paymentStatus,
      currency: orders.currency,
      totalMinor: orders.totalMinor,
      createdAt: orders.createdAt
    })
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));
}

export async function findOrderForUser(userId: string, number: string) {
  const [order] = await getDatabase()
    .select({
      id: orders.id,
      number: orders.number,
      status: orders.status,
      paymentStatus: orders.paymentStatus,
      shippingMethod: orders.shippingMethod,
      currency: orders.currency,
      subtotalMinor: orders.subtotalMinor,
      shippingMinor: orders.shippingMinor,
      totalMinor: orders.totalMinor,
      customerName: orders.customerName,
      addressLine1: orders.addressLine1,
      addressLine2: orders.addressLine2,
      city: orders.city,
      region: orders.region,
      postalCode: orders.postalCode,
      countryCode: orders.countryCode,
      createdAt: orders.createdAt
    })
    .from(orders)
    .where(and(eq(orders.userId, userId), eq(orders.number, number)))
    .limit(1);

  if (!order) return null;
  const items = await listOrderItems(order.id);
  return {...order, items};
}

export async function findOrderAccess(number: string, userId: string | null, confirmationToken: string | null) {
  const [order] = await getDatabase()
    .select({
      id: orders.id,
      userId: orders.userId,
      confirmationToken: orders.confirmationToken,
      status: orders.status,
      paymentStatus: orders.paymentStatus
    })
    .from(orders)
    .where(eq(orders.number, number))
    .limit(1);

  if (!order) return null;
  const allowedByUser = Boolean(userId && order.userId === userId);
  const allowedByToken = Boolean(confirmationToken && order.confirmationToken === confirmationToken);
  return allowedByUser || allowedByToken ? order : null;
}
