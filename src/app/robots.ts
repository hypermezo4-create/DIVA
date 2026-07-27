import type {MetadataRoute} from 'next';
import {getSiteUrl} from '@/lib/site-url';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/*/admin',
        '/*/admin/',
        '/*/account',
        '/*/account/',
        '/*/cart',
        '/*/checkout',
        '/*/wishlist',
        '/*/order/'
      ]
    },
    sitemap: new URL('/sitemap.xml', siteUrl).toString(),
    host: siteUrl.origin
  };
}
