import {NextRequest, NextResponse} from 'next/server';
import {z} from 'zod';
import {cancelPendingOrder, OrderLifecycleError} from '@/features/orders/lifecycle';
import {findOrderAccess} from '@/features/orders/repository';
import {getSessionFromHeaders} from '@/lib/session';

const schema = z.object({
  orderNumber: z.string().trim().min(6).max(32),
  confirmationToken: z.string().trim().min(32).max(128).optional()
});

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({error: 'INVALID_ORDER'}, {status: 400});

  const session = await getSessionFromHeaders(request.headers);
  const order = await findOrderAccess(
    parsed.data.orderNumber,
    session?.user.id ?? null,
    parsed.data.confirmationToken ?? null
  );

  if (!order) return NextResponse.json({error: 'ORDER_NOT_FOUND'}, {status: 404});

  try {
    const result = await cancelPendingOrder(order.id);
    return NextResponse.json({status: 'cancelled', changed: result.changed});
  } catch (error) {
    if (error instanceof OrderLifecycleError) {
      const status = error.code === 'INVALID_ORDER_STATE' ? 409 : 400;
      return NextResponse.json({error: error.code}, {status});
    }
    throw error;
  }
}
