import {NextRequest, NextResponse} from 'next/server';
import {z} from 'zod';
import {
  addCartItem,
  CustomerCommerceError,
  getCartLines,
  removeCartItem,
  setCartItemQuantity
} from '@/features/customer-commerce/repository';
import {isAppLocale} from '@/i18n/routing';
import {isTrustedMutationRequest} from '@/lib/request-security';
import {getSessionFromHeaders} from '@/lib/session';

const cartItemSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().min(1).max(20)
});

function commerceError(error: unknown) {
  if (error instanceof CustomerCommerceError) {
    return NextResponse.json({error: error.code}, {status: 409});
  }
  throw error;
}

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
  return NextResponse.json({items: await getCartLines(user.id, locale)});
}

export async function POST(request: NextRequest) {
  const crossSite = rejectCrossSite(request);
  if (crossSite) return crossSite;
  const user = await authenticatedUser(request);
  if (!user) return NextResponse.json({error: 'UNAUTHORIZED'}, {status: 401});
  const parsed = cartItemSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({error: 'INVALID_ITEM'}, {status: 400});
  try {
    await addCartItem(user.id, parsed.data.variantId, parsed.data.quantity);
    return NextResponse.json({ok: true}, {status: 201});
  } catch (error) {
    return commerceError(error);
  }
}

export async function PATCH(request: NextRequest) {
  const crossSite = rejectCrossSite(request);
  if (crossSite) return crossSite;
  const user = await authenticatedUser(request);
  if (!user) return NextResponse.json({error: 'UNAUTHORIZED'}, {status: 401});
  const parsed = cartItemSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({error: 'INVALID_ITEM'}, {status: 400});
  try {
    await setCartItemQuantity(user.id, parsed.data.variantId, parsed.data.quantity);
    return NextResponse.json({ok: true});
  } catch (error) {
    return commerceError(error);
  }
}

export async function DELETE(request: NextRequest) {
  const crossSite = rejectCrossSite(request);
  if (crossSite) return crossSite;
  const user = await authenticatedUser(request);
  if (!user) return NextResponse.json({error: 'UNAUTHORIZED'}, {status: 401});
  const parsed = z.object({variantId: z.string().uuid()}).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({error: 'INVALID_ITEM'}, {status: 400});
  await removeCartItem(user.id, parsed.data.variantId);
  return NextResponse.json({ok: true});
}
