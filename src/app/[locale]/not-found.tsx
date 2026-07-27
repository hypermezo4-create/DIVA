'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {isAppLocale} from '@/i18n/routing';
import {systemCopy} from './system-copy';
import styles from './system-page.module.css';

export default function NotFound() {
  const pathname = usePathname();
  const candidate = pathname.split('/').filter(Boolean)[0];
  const locale = isAppLocale(candidate) ? candidate : 'en';
  const copy = systemCopy[locale];

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <p className={styles.kicker}>DIVA · 404</p>
        <h1>{copy.notFoundTitle}</h1>
        <p>{copy.notFoundText}</p>
        <div className={styles.actions}>
          <Link className="button button--primary" href={`/${locale}`}>{copy.home}</Link>
          <Link className="button button--ghost" href={`/${locale}/shop`}>{copy.shop}</Link>
        </div>
      </section>
    </main>
  );
}
