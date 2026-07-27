import {NextRequest, NextResponse} from 'next/server';
import {listActiveShippingMethods} from '@/features/shipping/repository';
import {isAppLocale} from '@/i18n/routing';

export async function GET(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get('locale');
  const currency = request.nextUrl.searchParams.get('currency');

  if (!locale || !isAppLocale(locale) || !currency || !/^[A-Z]{3}$/.test(currency)) {
    return NextResponse.json({error: 'INVALID_SHIPPING_QUERY'}, {status: 400});
  }

  const methods = await listActiveShippingMethods(locale, currency);
  return NextResponse.json({methods});
}
