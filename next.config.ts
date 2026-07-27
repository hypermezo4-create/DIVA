import type {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
const isProduction = process.env.NODE_ENV === 'production';

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob: https://images.unsplash.com",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline'${isProduction ? '' : " 'unsafe-eval'"}`,
  "connect-src 'self'",
  isProduction ? 'upgrade-insecure-requests' : ''
].filter(Boolean).join('; ');

const securityHeaders = [
  {key: 'Content-Security-Policy', value: contentSecurityPolicy},
  {key: 'Cross-Origin-Opener-Policy', value: 'same-origin'},
  {key: 'Cross-Origin-Resource-Policy', value: 'same-origin'},
  {key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(self)'},
  {key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin'},
  {key: 'X-Content-Type-Options', value: 'nosniff'},
  {key: 'X-DNS-Prefetch-Control', value: 'off'},
  {key: 'X-Frame-Options', value: 'DENY'}
];

if (isProduction) {
  securityHeaders.push({
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  });
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      }
    ]
  },
  async headers() {
    return [
      {source: '/:path*', headers: securityHeaders},
      {
        source: '/api/:path*',
        headers: [
          {key: 'Cache-Control', value: 'no-store'},
          {key: 'X-Robots-Tag', value: 'noindex, nofollow'}
        ]
      }
    ];
  }
};

export default withNextIntl(nextConfig);
