import {NextRequest, NextResponse} from 'next/server';
import {z} from 'zod';
import {getAdminSession} from '@/features/admin/access';
import {AdminMutationError, updateAdminProduct} from '@/features/admin/mutations';

const schema = z.object({
  status: z.enum(['draft', 'active', 'archived']).optional(),
  newArrival: z.boolean().optional()
}).refine((value) => value.status !== undefined || value.newArrival !== undefined);

export async function PATCH(request: NextRequest, {params}: {params: Promise<{id: string}>}) {
  if (!await getAdminSession(request.headers)) {
    return NextResponse.json({error: 'FORBIDDEN'}, {status: 403});
  }

  const {id} = await params;
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({error: 'INVALID_PRODUCT'}, {status: 400});
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({error: 'INVALID_PRODUCT_UPDATE'}, {status: 400});

  try {
    const product = await updateAdminProduct({productId: id, ...parsed.data});
    return NextResponse.json({product});
  } catch (error) {
    if (error instanceof AdminMutationError) {
      return NextResponse.json({error: error.code}, {status: error.code === 'NOT_FOUND' ? 404 : 409});
    }
    throw error;
  }
}
