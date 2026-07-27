import type {NextRequest} from 'next/server';

function parseOrigin(rawUrl: string) {
  try {
    return new URL(rawUrl).origin;
  } catch (error) {
    if (error instanceof TypeError) return null;
    throw error;
  }
}

function configuredOrigins() {
  const configuredUrls = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.BETTER_AUTH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined
  ].filter((rawUrl): rawUrl is string => Boolean(rawUrl));

  return new Set(configuredUrls.map(parseOrigin).filter((origin): origin is string => origin !== null));
}

export function isTrustedMutationRequest(request: NextRequest) {
  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite && fetchSite !== 'same-origin' && fetchSite !== 'none') return false;

  const origin = request.headers.get('origin');
  if (!origin) return fetchSite === 'same-origin' || fetchSite === 'none';

  const allowedOrigins = configuredOrigins();
  allowedOrigins.add(request.nextUrl.origin);
  return allowedOrigins.has(origin);
}
