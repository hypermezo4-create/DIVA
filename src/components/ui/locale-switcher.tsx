'use client';

import {usePathname, useRouter} from 'next/navigation';
import {type ChangeEvent, useTransition} from 'react';
import {locales, type AppLocale} from '@/i18n/routing';

const labels: Record<AppLocale, string> = {
  en: 'EN',
  ar: 'AR',
  de: 'DE',
  ru: 'RU'
};

export function LocaleSwitcher({locale, label}: {locale: AppLocale; label: string}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function changeLocale(event: ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value as AppLocale;
    const segments = pathname.split('/');
    segments[1] = nextLocale;
    const nextPathname = segments.join('/') || `/${nextLocale}`;
    const query = window.location.search;

    startTransition(() => {
      router.replace(`${nextPathname}${query}`);
    });
  }

  return (
    <label className="locale-control">
      <span className="sr-only">{label}</span>
      <select value={locale} onChange={changeLocale} disabled={isPending} aria-label={label}>
        {locales.map((option) => (
          <option key={option} value={option}>
            {labels[option]}
          </option>
        ))}
      </select>
    </label>
  );
}
