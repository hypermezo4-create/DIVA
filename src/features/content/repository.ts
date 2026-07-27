import 'server-only';

import {asc, eq} from 'drizzle-orm';
import {getDatabase} from '@/db/client';
import {siteContent} from '@/db/schema';
import type {AppLocale} from '@/i18n/routing';
import type {StorefrontContentKey} from './definitions';

export async function getStorefrontContent(locale: AppLocale) {
  if (!process.env.DATABASE_URL) return new Map<StorefrontContentKey, string>();

  const rows = await getDatabase()
    .select({key: siteContent.key, value: siteContent.value})
    .from(siteContent)
    .where(eq(siteContent.locale, locale))
    .orderBy(asc(siteContent.key));

  return new Map(rows.map((row) => [row.key as StorefrontContentKey, row.value]));
}

export async function listStorefrontContentOverrides() {
  return getDatabase()
    .select({
      key: siteContent.key,
      locale: siteContent.locale,
      value: siteContent.value,
      updatedAt: siteContent.updatedAt,
      updatedBy: siteContent.updatedBy
    })
    .from(siteContent)
    .orderBy(asc(siteContent.key), asc(siteContent.locale));
}

export async function setStorefrontContent({
  key,
  locale,
  value,
  updatedBy
}: {
  key: StorefrontContentKey;
  locale: AppLocale;
  value: string;
  updatedBy: string;
}) {
  const [row] = await getDatabase()
    .insert(siteContent)
    .values({key, locale, value, updatedBy, updatedAt: new Date()})
    .onConflictDoUpdate({
      target: [siteContent.key, siteContent.locale],
      set: {value, updatedBy, updatedAt: new Date()}
    })
    .returning({key: siteContent.key, locale: siteContent.locale, value: siteContent.value});
  return row;
}
