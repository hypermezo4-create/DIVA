import {defineRouting} from 'next-intl/routing';

export const locales = ['en', 'ar', 'de', 'ru'] as const;
export type AppLocale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: 'en',
  localePrefix: 'always'
});

export function isAppLocale(value: string | undefined): value is AppLocale {
  return value !== undefined && locales.includes(value as AppLocale);
}

export function directionFor(locale: AppLocale) {
  return locale === 'ar' ? 'rtl' : 'ltr';
}
