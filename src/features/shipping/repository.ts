import 'server-only';

import {and, asc, eq} from 'drizzle-orm';
import {getDatabase} from '@/db/client';
import {shippingMethods, shippingMethodTranslations} from '@/db/schema';
import type {AppLocale} from '@/i18n/routing';

export async function listActiveShippingMethods(locale: AppLocale, currency: string) {
  return getDatabase()
    .select({
      code: shippingMethods.code,
      priceMinor: shippingMethods.priceMinor,
      currency: shippingMethods.currency,
      name: shippingMethodTranslations.name,
      description: shippingMethodTranslations.description
    })
    .from(shippingMethods)
    .innerJoin(
      shippingMethodTranslations,
      and(
        eq(shippingMethodTranslations.methodCode, shippingMethods.code),
        eq(shippingMethodTranslations.locale, locale)
      )
    )
    .where(and(eq(shippingMethods.active, true), eq(shippingMethods.currency, currency)))
    .orderBy(asc(shippingMethods.sortOrder), asc(shippingMethods.code));
}
