import 'server-only';

import {asc, eq} from 'drizzle-orm';
import {getDatabase} from '@/db/client';
import {orderItems, orders} from '@/db/schema';

export async function findOrderConfirmation(number: string) {
  const [order] = await getDatabase()
    .select({
      id: orders.id,
      number: orders.number,
      status: orders.status,
      paymentStatus: orders.paymentStatus,
      currency: orders.currency,
      subtotalMinor: orders.subtotalMinor,
      shippingMinor: orders.shippingMinor,
      totalMinor: orders.totalMinor,
      createdAt: orders.createdAt
    })
    .from(orders)
    .where(eq(orders.number, number))
    .limit(1);

  if (!order) return null;

  const items = await getDatabase()
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
    .where(eq(orderItems.orderId, order.id))
    .orderBy(asc(orderItems.productName));

  return {...order, items};
}
