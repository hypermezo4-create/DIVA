'use client';

import Link from 'next/link';
import {useCommerce} from '@/components/providers/commerce-provider';
import type {AppLocale} from '@/i18n/routing';
import styles from './commerce-header-actions.module.css';

function HeartIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" /></svg>;
}

function BagIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 8.5h11l1 11h-13l1-11Z" /><path d="M9 9V6.8a3 3 0 0 1 6 0V9" /></svg>;
}

export function CommerceHeaderActions({locale, wishlistLabel, cartLabel}: {locale: AppLocale; wishlistLabel: string; cartLabel: string}) {
  const {cartCount, wishlistCount} = useCommerce();
  return (
    <div className={styles.actions}>
      <Link href={`/${locale}/wishlist`} className={styles.action} aria-label={`${wishlistLabel} (${wishlistCount})`}>
        <HeartIcon />
        {wishlistCount > 0 && <span>{wishlistCount}</span>}
      </Link>
      <Link href={`/${locale}/cart`} className={styles.action} aria-label={`${cartLabel} (${cartCount})`}>
        <BagIcon />
        {cartCount > 0 && <span>{cartCount}</span>}
      </Link>
    </div>
  );
}
