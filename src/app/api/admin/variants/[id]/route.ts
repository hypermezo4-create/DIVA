import {NextRequest, NextResponse} from 'next/server';
import {z} from 'zod';
import {getAdminSession} from '@/features/admin/access';
import {AdminMutationError, updateAdminVariant} from '@/features/admin/mutations';
import {isTrustedMutationRequest} from '@/lib/request-security';

const schema = z.object({
  priceMinor: z.number().int().min(0).nullable().optional(),
  compareAtMinor: z.number().int().min(0).nullable().optional(),
  active: z.boolean().optional()
}).refine((value) => value.priceMinor !== undefined || value.compareAtMinor !== undefined || value.active !== undefined);

export async function PATCH(request: NextRequest, {params}: {params: Promise<{id: string}>}) {
  if (!isTrustedMutationRequest(request)) {
    return NextResponse.json({error: 'CROSS_SITE_REQUEST'}, {status: 403});
  }
  if (!await getAdminSession(request.headers)) {
    return NextResponse.json({error: 'FORBIDDEN'}, {status: 403});
  }

  const {id} = await params;
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({error: 'INVALID_VARIANT'}, {status: 400});
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({error: 'INVALID_VARIANT_UPDATE'}, {status: 400});

  try {
    const variant = await updateAdminVariant({variantId: id, ...parsed.data});
    return NextResponse.json({variant});
  } catch (error) {
    if (error instanceof AdminMutationError) {
      return NextResponse.json({error: error.code}, {status: error.code === 'NOT_FOUND' ? 404 : 409});
    }
    throw error;
  }
}
