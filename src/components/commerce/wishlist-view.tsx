'use client';

import Image from 'next/image';
import Link from 'next/link';
import {useState} from 'react';
import {useCommerce} from '@/components/providers/commerce-provider';
import type {AppLocale} from '@/i18n/routing';
import styles from './commerce-page.module.css';

type Copy = {
  empty: string;
  continueShopping: string;
  remove: string;
};

export function WishlistView({locale, copy}: {locale: AppLocale; copy: Copy}) {
  const {wishlist, ready, toggleWishlist} = useCommerce();
  const [busyProduct, setBusyProduct] = useState<string | null>(null);

  if (!ready) return <div className={styles.empty} />;

  if (wishlist.length === 0) {
    return (
      <div className={styles.empty}>
        <div>
          <p>{copy.empty}</p>
          <Link href={`/${locale}/shop`} className="button button--primary">{copy.continueShopping}</Link>
        </div>
      </div>
    );
  }

  async function remove(productId: string) {
    setBusyProduct(productId);
    try {
      await toggleWishlist(productId);
    } finally {
      setBusyProduct(null);
    }
  }

  return (
    <div className={styles.wishlistGrid}>
      {wishlist.map((item) => (
        <article className={styles.wishlistCard} key={item.productId} aria-busy={busyProduct === item.productId}>
          <Link href={`/${locale}/product/${item.slug}`} className={styles.image}>
            {item.image && <Image src={item.image} alt={item.name} fill sizes="(max-width: 560px) 100vw, 33vw" />}
          </Link>
          <div className={styles.wishlistCopy}>
            <Link href={`/${locale}/product/${item.slug}`}>
              <h2>{item.name}</h2>
              <p>{item.subtitle}</p>
            </Link>
            <button className={styles.remove} type="button" disabled={busyProduct === item.productId} onClick={() => void remove(item.productId)}>
              {copy.remove}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
