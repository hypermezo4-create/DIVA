'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect} from 'react';
import {isAppLocale} from '@/i18n/routing';
import {systemCopy} from './system-copy';
import styles from './system-page.module.css';

export default function ErrorPage({
  error,
  reset
}: {
  error: Error & {digest?: string};
  reset: () => void;
}) {
  const pathname = usePathname();
  const candidate = pathname.split('/').filter(Boolean)[0];
  const locale = isAppLocale(candidate) ? candidate : 'en';
  const copy = systemCopy[locale];

  useEffect(() => {
    console.error('DIVA route error', {digest: error.digest});
  }, [error.digest]);

  return (
    <main className={styles.page}>
      <section className={styles.card} role="alert">
        <p className={styles.kicker}>DIVA · RECOVERY</p>
        <h1>{copy.errorTitle}</h1>
        <p>{copy.errorText}</p>
        <div className={styles.actions}>
          <button className="button button--primary" type="button" onClick={reset}>{copy.retry}</button>
          <Link className="button button--ghost" href={`/${locale}`}>{copy.home}</Link>
        </div>
      </section>
    </main>
  );
}
