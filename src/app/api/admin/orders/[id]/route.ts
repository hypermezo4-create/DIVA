import {NextRequest, NextResponse} from 'next/server';
import {z} from 'zod';
import {getAdminSession} from '@/features/admin/access';
import {AdminMutationError, transitionAdminOrder} from '@/features/admin/mutations';

const schema = z.object({target: z.enum(['cancelled', 'processing', 'shipped', 'delivered'])});

export async function PATCH(request: NextRequest, {params}: {params: Promise<{id: string}>}) {
  if (!await getAdminSession(request.headers)) {
    return NextResponse.json({error: 'FORBIDDEN'}, {status: 403});
  }

  const {id} = await params;
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({error: 'INVALID_ORDER'}, {status: 400});
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({error: 'INVALID_ORDER_UPDATE'}, {status: 400});

  try {
    const order = await transitionAdminOrder(id, parsed.data.target);
    return NextResponse.json({order});
  } catch (error) {
    if (error instanceof AdminMutationError) {
      return NextResponse.json({error: error.code}, {status: error.code === 'NOT_FOUND' ? 404 : 409});
    }
    throw error;
  }
}
