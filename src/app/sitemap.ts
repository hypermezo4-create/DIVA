import type {MetadataRoute} from 'next';
import {listActiveProductSitemapEntries} from '@/features/catalog/server/catalog-repository';
import {locales} from '@/i18n/routing';
import {getSiteUrl} from '@/lib/site-url';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();
  const products = await listActiveProductSitemapEntries();

  const storefront = locales.flatMap((locale) => [
    {
      url: new URL(`/${locale}`, siteUrl).toString(),
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 1
    },
    {
      url: new URL(`/${locale}/shop`, siteUrl).toString(),
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.9
    }
  ]);

  const productPages = products.flatMap((product) => locales.map((locale) => ({
    url: new URL(`/${locale}/product/${product.slug}`, siteUrl).toString(),
    lastModified: product.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8
  })));

  return [...storefront, ...productPages];
}
