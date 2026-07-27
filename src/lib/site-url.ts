export function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL
    ?? process.env.BETTER_AUTH_URL
    ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined)
    ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined)
    ?? 'http://localhost:3000';

  return new URL(raw.endsWith('/') ? raw : `${raw}/`);
}
