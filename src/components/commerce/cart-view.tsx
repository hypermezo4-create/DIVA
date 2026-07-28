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
  stockTemplate: string;
  checkout: string;
  checkoutSoon: string;
  refreshing: string;
};

function money(locale: AppLocale, minor: number, currency: string) {
  return new Intl.NumberFormat(locale, {style: 'currency', currency}).format(minor / 100);
}

function stockLabel(template: string, count: number) {
  return template.replace('{count}', String(count));
}

export function CartView({locale, copy}: {locale: AppLocale; copy: Copy}) {
  const {cart, ready, setCartQuantity, removeFromCart} = useCommerce();
  const [busyVariant, setBusyVariant] = useState<string | null>(null);

  if (!ready) {
    return <div className={styles.empty} aria-live="polite"><p>{copy.refreshing}</p></div>;
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
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

  async function updateQuantity(variantId: string, quantity: number) {
    if (quantity < 1) return;
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
      <section className={styles.lines} aria-label={copy.quantity}>
        {cart.map((item) => {
          const busy = busyVariant === item.variantId;
          const maxQuantity = Math.max(1, Math.min(20, item.available));

          return (
            <article className={styles.line} key={item.variantId} aria-busy={busy}>
              <Link href={`/${locale}/product/${item.slug}`} className={styles.image} aria-label={item.name}>
                {item.image && <Image src={item.image} alt="" fill sizes="(max-width: 560px) 98px, 148px" />}
              </Link>

              <div className={styles.copy}>
                <Link href={`/${locale}/product/${item.slug}`}><h2>{item.name}</h2></Link>
                <p className={styles.meta}>{item.colorLabel} · {item.size}</p>
                <p className={styles.stock}>{stockLabel(copy.stockTemplate, item.available)}</p>
              </div>

              <div className={styles.lineActions}>
                <strong className={styles.price}>{money(locale, item.priceMinor * item.quantity, item.currency)}</strong>
                <div className={styles.quantityControl} aria-label={copy.quantity}>
                  <button
                    type="button"
                    disabled={busy || item.quantity <= 1}
                    aria-label={`${copy.quantity} ${Math.max(1, item.quantity - 1)}`}
                    onClick={() => void updateQuantity(item.variantId, item.quantity - 1)}
                  >
                    −
                  </button>
                  <span aria-live="polite">{item.quantity}</span>
                  <button
                    type="button"
                    disabled={busy || item.available <= 0 || item.quantity >= maxQuantity}
                    aria-label={`${copy.quantity} ${Math.min(maxQuantity, item.quantity + 1)}`}
                    onClick={() => void updateQuantity(item.variantId, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <button className={styles.remove} type="button" disabled={busy} onClick={() => void remove(item.variantId)}>
                  {copy.remove}
                </button>
              </div>
            </article>
          );
        })}
      </section>

      <aside className={styles.summary} aria-label={copy.subtotal}>
        <div className={styles.summaryEyebrow} translate="no">DIVA · BAG SUMMARY</div>
        <div className={styles.summaryRow}>
          <span>{copy.quantity}</span>
          <strong>{itemCount}</strong>
        </div>
        <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
          <span>{copy.subtotal}</span>
          <strong>{subtotal !== null ? money(locale, subtotal, currencies[0]) : '—'}</strong>
        </div>
        {subtotal !== null ? (
          <Link href={`/${locale}/checkout`} className="button button--primary">{copy.checkout}</Link>
        ) : (
          <button className="button button--primary" type="button" disabled>{copy.checkout}</button>
        )}
        <Link href={`/${locale}/shop`} className={styles.continueLink}>{copy.continueShopping} ↗</Link>
        <small>{copy.checkoutSoon}</small>
      </aside>
    </div>
  );
}
