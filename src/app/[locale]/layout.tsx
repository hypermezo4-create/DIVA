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
import '../storefront-polish.css';
import '../product-experience.css';
import '../home-editorial.css';
import '../shop-experience.css';
import '../editorial-image-stage.css';

const brandMark = '/brand/diva-logo-original-mark.svg';
const brandLockup = '/brand/diva-logo-original-full.svg';

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  applicationName: 'DIVA',
  title: {
    default: 'DIVA · Premium Mirror',
    template: '%s · DIVA'
  },
  description: 'DIVA luxury footwear — a premium multilingual storefront for signature footwear.',
  formatDetection: {telephone: false, address: false, email: false},
  icons: {
    icon: brandMark,
    shortcut: brandMark,
    apple: brandMark
  },
  openGraph: {
    type: 'website',
    siteName: 'DIVA',
    title: 'DIVA · Premium Mirror',
    description: 'Luxury footwear for women, men and kids.',
    images: [{url: brandLockup, alt: 'DIVA Premium Mirror luxury footwear'}]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DIVA · Premium Mirror',
    description: 'Luxury footwear for women, men and kids.',
    images: [brandLockup]
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light dark',
  themeColor: [
    {media: '(prefers-color-scheme: light)', color: '#f7ecdd'},
    {media: '(prefers-color-scheme: dark)', color: '#120c08'}
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
