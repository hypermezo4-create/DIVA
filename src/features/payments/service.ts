import 'server-only';

import {eq} from 'drizzle-orm';
import {getDatabase} from '@/db/client';
import {orders, paymentAttempts} from '@/db/schema';
import {confirmPaidOrder} from '@/features/orders/lifecycle';

export class PaymentError extends Error {
  constructor(public readonly code: 'ORDER_NOT_FOUND' | 'INVALID_ORDER_STATE' | 'PAYMENT_NOT_FOUND' | 'PAYMENT_AMOUNT_MISMATCH') {
    super(code);
  }
}

export async function createPaymentAttempt({
  orderId,
  provider,
  idempotencyKey
}: {
  orderId: string;
  provider: string;
  idempotencyKey: string;
}) {
  const db = getDatabase();
  const [existing] = await db
    .select()
    .from(paymentAttempts)
    .where(eq(paymentAttempts.idempotencyKey, idempotencyKey))
    .limit(1);
  if (existing) return existing;

  const [order] = await db
    .select({
      id: orders.id,
      status: orders.status,
      paymentStatus: orders.paymentStatus,
      totalMinor: orders.totalMinor,
      currency: orders.currency
    })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order) throw new PaymentError('ORDER_NOT_FOUND');
  if (order.status !== 'pending_payment' || order.paymentStatus !== 'pending') {
    throw new PaymentError('INVALID_ORDER_STATE');
  }

  const [attempt] = await db
    .insert(paymentAttempts)
    .values({
      orderId,
      provider,
      idempotencyKey,
      amountMinor: order.totalMinor,
      currency: order.currency
    })
    .returning();

  if (!attempt) throw new Error('Payment attempt insert did not return a row.');
  return attempt;
}

export async function markPaymentPending({
  attemptId,
  providerReference,
  checkoutUrl
}: {
  attemptId: string;
  providerReference: string;
  checkoutUrl?: string;
}) {
  const [attempt] = await getDatabase()
    .update(paymentAttempts)
    .set({
      status: 'pending',
      providerReference,
      checkoutUrl: checkoutUrl ?? null,
      updatedAt: new Date()
    })
    .where(eq(paymentAttempts.id, attemptId))
    .returning();

  if (!attempt) throw new PaymentError('PAYMENT_NOT_FOUND');
  return attempt;
}

export async function markPaymentFailed(attemptId: string) {
  const [attempt] = await getDatabase()
    .update(paymentAttempts)
    .set({status: 'failed', updatedAt: new Date()})
    .where(eq(paymentAttempts.id, attemptId))
    .returning();

  if (!attempt) throw new PaymentError('PAYMENT_NOT_FOUND');
  return attempt;
}

export async function markPaymentPaid(attemptId: string) {
  const db = getDatabase();
  const [attempt] = await db
    .select()
    .from(paymentAttempts)
    .where(eq(paymentAttempts.id, attemptId))
    .limit(1);
  if (!attempt) throw new PaymentError('PAYMENT_NOT_FOUND');
  if (attempt.status === 'paid') return attempt;

  const [order] = await db
    .select({totalMinor: orders.totalMinor, currency: orders.currency})
    .from(orders)
    .where(eq(orders.id, attempt.orderId))
    .limit(1);
  if (!order) throw new PaymentError('ORDER_NOT_FOUND');
  if (order.totalMinor !== attempt.amountMinor || order.currency !== attempt.currency) {
    throw new PaymentError('PAYMENT_AMOUNT_MISMATCH');
  }

  await confirmPaidOrder(attempt.orderId);

  const [paid] = await db
    .update(paymentAttempts)
    .set({status: 'paid', updatedAt: new Date()})
    .where(eq(paymentAttempts.id, attemptId))
    .returning();
  if (!paid) throw new PaymentError('PAYMENT_NOT_FOUND');
  return paid;
}

export type PaymentProviderHandoff = {
  providerReference: string;
  checkoutUrl: string;
};

export type PaymentProvider = {
  code: string;
  createHandoff(input: {
    attemptId: string;
    orderNumber: string;
    amountMinor: number;
    currency: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<PaymentProviderHandoff>;
};
