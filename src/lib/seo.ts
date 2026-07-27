import {locales, type AppLocale} from '@/i18n/routing';

export function localizedPath(locale: AppLocale, pathname = '') {
  const suffix = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `/${locale}${suffix === '/' ? '' : suffix}`;
}

export function languageAlternates(pathname = '') {
  return Object.fromEntries([
    ...locales.map((locale) => [locale, localizedPath(locale, pathname)] as const),
    ['x-default', localizedPath('en', pathname)] as const
  ]);
}
