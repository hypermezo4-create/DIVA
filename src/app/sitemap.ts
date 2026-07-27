import type {MetadataRoute} from 'next';
import {locales} from '@/i18n/routing';
import {getSiteUrl} from '@/lib/site-url';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const now = new Date();
  const paths = ['', '/shop'];

  return locales.flatMap((locale) => paths.map((path) => ({
    url: new URL(`/${locale}${path}`, siteUrl).toString(),
    lastModified: now,
    changeFrequency: path ? 'daily' as const : 'weekly' as const,
    priority: path ? 0.9 : 1
  })));
}
