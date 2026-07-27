import {NextRequest, NextResponse} from 'next/server';
import {z} from 'zod';
import {CheckoutError, createCheckoutOrder} from '@/features/checkout/service';
import {isAppLocale} from '@/i18n/routing';
import {isTrustedMutationRequest} from '@/lib/request-security';
import {getSessionFromHeaders} from '@/lib/session';

const checkoutSchema = z.object({
  locale: z.string(),
  items: z.array(z.object({
    variantId: z.string().uuid(),
    quantity: z.number().int().min(1).max(20)
  })).min(1).max(50),
  shippingMethod: z.string().trim().min(1).max(64).regex(/^[a-z0-9_-]+$/),
  address: z.object({
    customerName: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(160),
    phone: z.string().trim().min(6).max(40),
    addressLine1: z.string().trim().min(3).max(180),
    addressLine2: z.string().trim().max(180).optional(),
    city: z.string().trim().min(2).max(100),
    region: z.string().trim().max(100).optional(),
    postalCode: z.string().trim().max(30).optional(),
    countryCode: z.string().trim().length(2)
  })
});

export async function POST(request: NextRequest) {
  if (!isTrustedMutationRequest(request)) {
    return NextResponse.json({error: 'CROSS_SITE_REQUEST'}, {status: 403});
  }

  const parsed = checkoutSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !isAppLocale(parsed.data.locale)) {
    return NextResponse.json({error: 'INVALID_CHECKOUT'}, {status: 400});
  }

  const session = await getSessionFromHeaders(request.headers);

  try {
    const order = await createCheckoutOrder({
      userId: session?.user.id ?? null,
      locale: parsed.data.locale,
      items: parsed.data.items,
      address: parsed.data.address,
      shippingMethod: parsed.data.shippingMethod
    });
    return NextResponse.json(order, {status: 201});
  } catch (error) {
    if (error instanceof CheckoutError) {
      const status = error.code === 'INSUFFICIENT_STOCK' ? 409 : 400;
      return NextResponse.json({error: error.code}, {status});
    }
    throw error;
  }
}
