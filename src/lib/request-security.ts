import type {NextRequest} from 'next/server';

function configuredOrigins() {
  const values = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.BETTER_AUTH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined
  ].filter((value): value is string => Boolean(value));

  const origins = new Set<string>();
  for (const value of values) {
    try {
      origins.add(new URL(value).origin);
    } catch {
      // Invalid optional deployment metadata should not widen the allow-list.
    }
  }
  return origins;
}

export function isTrustedMutationRequest(request: NextRequest) {
  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite && fetchSite !== 'same-origin' && fetchSite !== 'none') return false;

  const origin = request.headers.get('origin');
  if (!origin) return fetchSite === 'same-origin' || fetchSite === 'none';

  const allowed = configuredOrigins();
  allowed.add(request.nextUrl.origin);
  return allowed.has(origin);
}
