import {NextRequest, NextResponse} from 'next/server';
import {z} from 'zod';
import {
  addWishlistItem,
  CustomerCommerceError,
  getWishlistEntries,
  removeWishlistItem
} from '@/features/customer-commerce/repository';
import {isAppLocale} from '@/i18n/routing';
import {isTrustedMutationRequest} from '@/lib/request-security';
import {getSessionFromHeaders} from '@/lib/session';

const itemSchema = z.object({productId: z.string().uuid()});

async function authenticatedUser(request: NextRequest) {
  const session = await getSessionFromHeaders(request.headers);
  return session?.user ?? null;
}

function rejectCrossSite(request: NextRequest) {
  return isTrustedMutationRequest(request)
    ? null
    : NextResponse.json({error: 'CROSS_SITE_REQUEST'}, {status: 403});
}

export async function GET(request: NextRequest) {
  const user = await authenticatedUser(request);
  if (!user) return NextResponse.json({error: 'UNAUTHORIZED'}, {status: 401});
  const locale = request.nextUrl.searchParams.get('locale') ?? 'en';
  if (!isAppLocale(locale)) return NextResponse.json({error: 'INVALID_LOCALE'}, {status: 400});
  return NextResponse.json({items: await getWishlistEntries(user.id, locale)});
}

export async function POST(request: NextRequest) {
  const crossSite = rejectCrossSite(request);
  if (crossSite) return crossSite;
  const user = await authenticatedUser(request);
  if (!user) return NextResponse.json({error: 'UNAUTHORIZED'}, {status: 401});
  const parsed = itemSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({error: 'INVALID_ITEM'}, {status: 400});

  try {
    await addWishlistItem(user.id, parsed.data.productId);
    return NextResponse.json({ok: true}, {status: 201});
  } catch (error) {
    if (error instanceof CustomerCommerceError && error.code === 'PRODUCT_NOT_FOUND') {
      return NextResponse.json({error: error.code}, {status: 404});
    }
    throw error;
  }
}

export async function DELETE(request: NextRequest) {
  const crossSite = rejectCrossSite(request);
  if (crossSite) return crossSite;
  const user = await authenticatedUser(request);
  if (!user) return NextResponse.json({error: 'UNAUTHORIZED'}, {status: 401});
  const parsed = itemSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({error: 'INVALID_ITEM'}, {status: 400});
  await removeWishlistItem(user.id, parsed.data.productId);
  return NextResponse.json({ok: true});
}
