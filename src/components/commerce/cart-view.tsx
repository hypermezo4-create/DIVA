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
  quantity: string;
  remove: string;
  subtotal: string;
  stock: (count: number) => string;
  checkout: string;
  checkoutSoon: string;
  refreshing: string;
};

function money(locale: AppLocale, minor: number, currency: string) {
  return new Intl.NumberFormat(locale, {style: 'currency', currency}).format(minor / 100);
}

export function CartView({locale, copy}: {locale: AppLocale; copy: Copy}) {
  const {cart, ready, setCartQuantity, removeFromCart} = useCommerce();
  const [busyVariant, setBusyVariant] = useState<string | null>(null);

  if (!ready) {
    return <div className={styles.empty}><p>{copy.refreshing}</p></div>;
  }

  if (cart.length === 0) {
    return (
      <div className={styles.empty}>
        <div>
          <p>{copy.empty}</p>
          <Link href={`/${locale}/shop`} className="button button--primary">{copy.continueShopping}</Link>
        </div>
      </div>
    );
  }

  const currencies = [...new Set(cart.map((item) => item.currency))];
  const subtotal = currencies.length === 1
    ? cart.reduce((total, item) => total + item.priceMinor * item.quantity, 0)
    : null;

  async function updateQuantity(variantId: string, quantity: number) {
    setBusyVariant(variantId);
    try {
      await setCartQuantity(variantId, quantity);
    } finally {
      setBusyVariant(null);
    }
  }

  async function remove(variantId: string) {
    setBusyVariant(variantId);
    try {
      await removeFromCart(variantId);
    } finally {
      setBusyVariant(null);
    }
  }

  return (
    <div className={styles.cartLayout}>
      <div className={styles.lines}>
        {cart.map((item) => (
          <article className={styles.line} key={item.variantId} aria-busy={busyVariant === item.variantId}>
            <Link href={`/${locale}/product/${item.slug}`} className={styles.image}>
              {item.image && <Image src={item.image} alt={item.name} fill sizes="132px" />}
            </Link>
            <div className={styles.copy}>
              <Link href={`/${locale}/product/${item.slug}`}><h2>{item.name}</h2></Link>
              <p className={styles.meta}>{item.colorLabel} · {item.size}</p>
              <p className={styles.stock}>{copy.stock(item.available)}</p>
            </div>
            <div className={styles.lineActions}>
              <strong className={styles.price}>{money(locale, item.priceMinor * item.quantity, item.currency)}</strong>
              <label className={styles.quantityLabel}>
                <span>{copy.quantity}</span>
                <select
                  value={item.quantity}
                  disabled={busyVariant === item.variantId || item.available <= 0}
                  onChange={(event) => void updateQuantity(item.variantId, Number(event.target.value))}
                >
                  {Array.from({length: Math.max(1, Math.min(20, item.available))}, (_, index) => index + 1).map((quantity) => (
                    <option value={quantity} key={quantity}>{quantity}</option>
                  ))}
                </select>
              </label>
              <button className={styles.remove} type="button" disabled={busyVariant === item.variantId} onClick={() => void remove(item.variantId)}>
                {copy.remove}
              </button>
            </div>
          </article>
        ))}
      </div>
      <aside className={styles.summary}>
        <div className={styles.summaryRow}>
          <span>{copy.subtotal}</span>
          <strong>{subtotal !== null ? money(locale, subtotal, currencies[0]) : '—'}</strong>
        </div>
        <button className="button button--primary" type="button" disabled>{copy.checkout}</button>
        <small>{copy.checkoutSoon}</small>
      </aside>
    </div>
  );
}
