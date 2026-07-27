'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import styles from './admin-shell.module.css';

export function InventoryRowControls({
  variantId,
  initialOnHand,
  initialPriceMinor,
  initialCompareAtMinor,
  initialActive,
  labels
}: {
  variantId: string;
  initialOnHand: number;
  initialPriceMinor: number | null;
  initialCompareAtMinor: number | null;
  initialActive: boolean;
  labels: {
    stock: string;
    priceMinor: string;
    compareAtMinor: string;
    active: string;
    saveStock: string;
    savePricing: string;
    saving: string;
    saved: string;
    error: string;
  };
}) {
  const router = useRouter();
  const [onHand, setOnHand] = useState(String(initialOnHand));
  const [priceMinor, setPriceMinor] = useState(initialPriceMinor === null ? '' : String(initialPriceMinor));
  const [compareAtMinor, setCompareAtMinor] = useState(initialCompareAtMinor === null ? '' : String(initialCompareAtMinor));
  const [active, setActive] = useState(initialActive);
  const [stockState, setStockState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [priceState, setPriceState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  async function saveStock() {
    const value = Number(onHand);
    if (!Number.isInteger(value) || value < 0) return setStockState('error');
    setStockState('saving');
    try {
      const response = await fetch(`/api/admin/inventory/${variantId}`, {
        method: 'PATCH',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({onHand: value})
      });
      if (!response.ok) throw new Error('STOCK_UPDATE_FAILED');
      setStockState('saved');
      router.refresh();
    } catch {
      setStockState('error');
    }
  }

  async function savePricing() {
    const price = priceMinor.trim() === '' ? null : Number(priceMinor);
    const compareAt = compareAtMinor.trim() === '' ? null : Number(compareAtMinor);
    if ((price !== null && (!Number.isInteger(price) || price < 0)) || (compareAt !== null && (!Number.isInteger(compareAt) || compareAt < 0))) {
      return setPriceState('error');
    }

    setPriceState('saving');
    try {
      const response = await fetch(`/api/admin/variants/${variantId}`, {
        method: 'PATCH',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({priceMinor: price, compareAtMinor: compareAt, active})
      });
      if (!response.ok) throw new Error('VARIANT_UPDATE_FAILED');
      setPriceState('saved');
      router.refresh();
    } catch {
      setPriceState('error');
    }
  }

  return (
    <div className={styles.controls}>
      <label>
        <span className={styles.muted}>{labels.stock}</span>
        <input className={styles.input} inputMode="numeric" value={onHand} onChange={(event) => { setOnHand(event.target.value); setStockState('idle'); }} />
      </label>
      <button className={styles.smallButton} type="button" disabled={stockState === 'saving'} onClick={() => void saveStock()}>
        {stockState === 'saving' ? labels.saving : labels.saveStock}
      </button>
      <label>
        <span className={styles.muted}>{labels.priceMinor}</span>
        <input className={`${styles.input} ${styles.inputWide}`} inputMode="numeric" value={priceMinor} onChange={(event) => { setPriceMinor(event.target.value); setPriceState('idle'); }} />
      </label>
      <label>
        <span className={styles.muted}>{labels.compareAtMinor}</span>
        <input className={`${styles.input} ${styles.inputWide}`} inputMode="numeric" value={compareAtMinor} onChange={(event) => { setCompareAtMinor(event.target.value); setPriceState('idle'); }} />
      </label>
      <label className={styles.controls}>
        <input type="checkbox" checked={active} onChange={(event) => { setActive(event.target.checked); setPriceState('idle'); }} />
        <span className={styles.muted}>{labels.active}</span>
      </label>
      <button className={styles.smallButton} type="button" disabled={priceState === 'saving'} onClick={() => void savePricing()}>
        {priceState === 'saving' ? labels.saving : labels.savePricing}
      </button>
      {stockState === 'saved' || priceState === 'saved' ? <span className={styles.success}>{labels.saved}</span> : null}
      {stockState === 'error' || priceState === 'error' ? <span className={styles.error}>{labels.error}</span> : null}
    </div>
  );
}
