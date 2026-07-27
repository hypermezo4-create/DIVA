import type {Metadata, Viewport} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {CommerceProvider} from '@/components/providers/commerce-provider';
import {ThemeProvider} from '@/components/providers/theme-provider';
import {directionFor, isAppLocale, locales} from '@/i18n/routing';
import {getSiteUrl} from '@/lib/site-url';
import '../globals.css';
import '../catalog.css';
import '../accessibility.css';
import '../storefront-redesign.css';

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  applicationName: 'DIVA',
  title: {
    default: 'DIVA · Premium Mirror',
    template: '%s · DIVA'
  },
  description: 'DIVA luxury footwear — a premium multilingual storefront for signature footwear.',
  formatDetection: {telephone: false, address: false, email: false},
  openGraph: {
    type: 'website',
    siteName: 'DIVA',
    title: 'DIVA · Premium Mirror',
    description: 'Luxury footwear for women, men and kids.'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DIVA · Premium Mirror',
    description: 'Luxury footwear for women, men and kids.'
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light dark',
  themeColor: [
    {media: '(prefers-color-scheme: light)', color: '#f5eee4'},
    {media: '(prefers-color-scheme: dark)', color: '#1f1712'}
  ]
};

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

export default async function LocaleLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}>) {
  const {locale} = await params;

  if (!isAppLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <html lang={locale} dir={directionFor(locale)} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <CommerceProvider locale={locale}>{children}</CommerceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
