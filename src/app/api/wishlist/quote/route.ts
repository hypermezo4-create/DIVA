import {NextRequest, NextResponse} from 'next/server';
import {z} from 'zod';
import {quoteWishlist} from '@/features/customer-commerce/repository';
import {isAppLocale} from '@/i18n/routing';

const quoteSchema = z.object({locale: z.string(), productIds: z.array(z.string().uuid()).max(100)});

export async function POST(request: NextRequest) {
  const parsed = quoteSchema.safeParse(await request.json());
  if (!parsed.success || !isAppLocale(parsed.data.locale)) {
    return NextResponse.json({error: 'INVALID_QUOTE'}, {status: 400});
  }

  return NextResponse.json({items: await quoteWishlist(parsed.data.productIds, parsed.data.locale)});
}
