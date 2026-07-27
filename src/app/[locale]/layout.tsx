import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {ThemeProvider} from '@/components/providers/theme-provider';
import {directionFor, isAppLocale, locales} from '@/i18n/routing';
import '../globals.css';

export const metadata: Metadata = {
  title: {
    default: 'DIVA · Premium Mirror',
    template: '%s · DIVA'
  },
  description: 'DIVA luxury footwear — a premium multilingual storefront for signature footwear.'
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
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
