'use client';

import {useMemo, useState} from 'react';
import {useCommerce} from '@/components/providers/commerce-provider';
import type {AppLocale} from '@/i18n/routing';
import styles from './product-purchase-panel.module.css';

type Variant = {
  id: string;
  sku: string;
  priceMinor: number | null;
  compareAtMinor: number | null;
  currency: string | null;
  size: string;
  colorCode: string;
  colorHex: string;
  colorLabel: string;
  available: number;
};

type Copy = {
  size: string;
  color: string;
  priceFrom: string;
  addToCart: string;
  adding: string;
  addToWishlist: string;
  removeFromWishlist: string;
  outOfStock: string;
  chooseOptions: string;
  unavailable: string;
  added: string;
};

function money(locale: AppLocale, minor: number, currency: string) {
  return new Intl.NumberFormat(locale, {style: 'currency', currency}).format(minor / 100);
}

export function ProductPurchasePanel({
  locale,
  productId,
  variants,
  commerceEnabled = true,
  copy
}: {
  locale: AppLocale;
  productId: string;
  variants: Variant[];
  commerceEnabled?: boolean;
  copy: Copy;
}) {
  const {addToCart, toggleWishlist, isWishlisted} = useCommerce();
  const colors = useMemo(() => {
    const unique = new Map<string, Pick<Variant, 'colorCode' | 'colorHex' | 'colorLabel'>>();
    variants.forEach((variant) => unique.set(variant.colorCode, variant));
    return [...unique.values()];
  }, [variants]);
  const [color, setColor] = useState(colors[0]?.colorCode ?? '');
  const sizes = useMemo(() => [...new Set(variants.filter((variant) => variant.colorCode === color).map((variant) => variant.size))], [color, variants]);
  const [size, setSize] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const selected = variants.find((variant) => variant.colorCode === color && variant.size === size);
  const sellable = Boolean(commerceEnabled && selected && selected.available > 0 && selected.priceMinor !== null && selected.currency);
  const availablePrices = variants.filter((variant) => variant.priceMinor !== null && variant.currency);
  const lowest = [...availablePrices].sort((a, b) => (a.priceMinor ?? 0) - (b.priceMinor ?? 0))[0];
  const displayed = selected?.priceMinor !== null && selected?.priceMinor !== undefined && selected.currency ? selected : lowest;
  const displayedOffer = displayed?.priceMinor !== null
    && displayed?.priceMinor !== undefined
    && displayed.compareAtMinor !== null
    && displayed.compareAtMinor > displayed.priceMinor;
  const wishlisted = commerceEnabled && isWishlisted(productId);

  async function add() {
    if (!commerceEnabled || !selected || !sellable) {
      setMessage(!commerceEnabled ? copy.unavailable : size ? copy.unavailable : copy.chooseOptions);
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      await addToCart(selected.id, 1);
      setMessage(copy.added);
    } catch {
      setMessage(copy.unavailable);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.panel}>
      <div className={styles.price}>
        <span>{copy.priceFrom}</span>
        <div className={styles.priceValues}>
          <strong>
            {displayed?.priceMinor !== null && displayed?.priceMinor !== undefined && displayed.currency
              ? money(locale, displayed.priceMinor, displayed.currency)
              : '—'}
          </strong>
          {displayedOffer && displayed?.currency && displayed.compareAtMinor !== null && (
            <del>{money(locale, displayed.compareAtMinor, displayed.currency)}</del>
          )}
        </div>
      </div>

      <fieldset className={styles.fieldset}>
        <legend>{copy.color}</legend>
        <div className={styles.colors}>
          {colors.map((option) => (
            <button
              key={option.colorCode}
              type="button"
              className={color === option.colorCode ? styles.selected : ''}
              onClick={() => { setColor(option.colorCode); setSize(''); setMessage(''); }}
              aria-pressed={color === option.colorCode}
            >
              <i style={{backgroundColor: option.colorHex}} aria-hidden="true" />
              {option.colorLabel}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend>{copy.size}</legend>
        <div className={styles.sizes}>
          {sizes.map((option) => {
            const variant = variants.find((item) => item.colorCode === color && item.size === option);
            const disabled = !variant || variant.available <= 0 || variant.priceMinor === null || !variant.currency;
            return (
              <button
                key={option}
                type="button"
                disabled={disabled}
                className={size === option ? styles.selected : ''}
                onClick={() => { setSize(option); setMessage(''); }}
                aria-pressed={size === option}
              >
                {option}
              </button>
            );
          })}
        </div>
      </fieldset>

      {!commerceEnabled && <p className={styles.notice}>{copy.unavailable}</p>}
      {commerceEnabled && selected && selected.available <= 0 && <p className={styles.notice}>{copy.outOfStock}</p>}
      {message && <p className={styles.notice} role="status">{message}</p>}

      <div className={styles.actions}>
        <button className="button button--primary" type="button" disabled={busy || !sellable} onClick={() => void add()}>
          {busy ? copy.adding : copy.addToCart}
        </button>
        <button
          className="button button--ghost"
          type="button"
          disabled={!commerceEnabled}
          onClick={() => void toggleWishlist(productId)}
        >
          {wishlisted ? copy.removeFromWishlist : copy.addToWishlist}
        </button>
      </div>
    </div>
  );
}
