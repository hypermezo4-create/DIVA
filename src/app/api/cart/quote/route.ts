import {NextRequest, NextResponse} from 'next/server';
import {z} from 'zod';
import {quoteGuestCart} from '@/features/customer-commerce/repository';
import {isAppLocale} from '@/i18n/routing';

const quoteSchema = z.object({
  locale: z.string(),
  items: z.array(z.object({variantId: z.string().uuid(), quantity: z.number().int().min(1).max(20)})).max(40)
});

export async function POST(request: NextRequest) {
  const parsed = quoteSchema.safeParse(await request.json());
  if (!parsed.success || !isAppLocale(parsed.data.locale)) {
    return NextResponse.json({error: 'INVALID_QUOTE'}, {status: 400});
  }

  return NextResponse.json({items: await quoteGuestCart(parsed.data.items, parsed.data.locale)});
}
