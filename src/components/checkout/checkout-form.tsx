'use client';

import {useEffect, useState, type FormEvent} from 'react';
import {useRouter} from 'next/navigation';
import {useCommerce} from '@/components/providers/commerce-provider';
import type {AppLocale} from '@/i18n/routing';
import styles from './checkout-form.module.css';

type Copy = {
  empty: string;
  backToCart: string;
  contact: string;
  delivery: string;
  name: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  region: string;
  postalCode: string;
  countryCode: string;
  shipping: string;
  shippingUnavailable: string;
  subtotal: string;
  shippingCost: string;
  total: string;
  placeOrder: string;
  placingOrder: string;
  refresh: string;
  error: string;
};

type ShippingMethod = {
  code: string;
  priceMinor: number;
  currency: string;
  name: string;
  description: string | null;
};

function money(locale: AppLocale, minor: number, currency: string) {
  return new Intl.NumberFormat(locale, {style: 'currency', currency}).format(minor / 100);
}

export function CheckoutForm({locale, copy}: {locale: AppLocale; copy: Copy}) {
  const router = useRouter();
  const {cart, ready, clearCart} = useCommerce();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [shippingCode, setShippingCode] = useState('');
  const [shippingLoading, setShippingLoading] = useState(false);

  const currencies = [...new Set(cart.map((item) => item.currency))];
  const currency = currencies.length === 1 ? currencies[0] : null;
  const subtotal = currency ? cart.reduce((sum, item) => sum + item.priceMinor * item.quantity, 0) : null;

  useEffect(() => {
    if (!ready || !currency || cart.length === 0) return;
    let cancelled = false;
    setShippingLoading(true);
    fetch(`/api/shipping?locale=${locale}&currency=${encodeURIComponent(currency)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error('SHIPPING_FETCH_FAILED');
        return response.json() as Promise<{methods: ShippingMethod[]}>;
      })
      .then(({methods}) => {
        if (cancelled) return;
        setShippingMethods(methods);
        setShippingCode((current) => methods.some((method) => method.code === current) ? current : (methods[0]?.code ?? ''));
      })
      .catch(() => {
        if (!cancelled) {
          setShippingMethods([]);
          setShippingCode('');
        }
      })
      .finally(() => {
        if (!cancelled) setShippingLoading(false);
      });
    return () => { cancelled = true; };
  }, [cart.length, currency, locale, ready]);

  if (!ready) return <div className={styles.status}>{copy.refresh}</div>;
  if (cart.length === 0) {
    return (
      <div className={styles.status}>
        <p>{copy.empty}</p>
        <button className="button button--ghost" type="button" onClick={() => router.push(`/${locale}/cart`)}>
          {copy.backToCart}
        </button>
      </div>
    );
  }

  const selectedShipping = shippingMethods.find((method) => method.code === shippingCode) ?? null;
  const shippingMinor = selectedShipping?.priceMinor ?? null;
  const totalMinor = subtotal !== null && shippingMinor !== null ? subtotal + shippingMinor : null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currency || subtotal === null || !selectedShipping) return setError(copy.error);

    setSubmitting(true);
    setError(null);
    const data = new FormData(event.currentTarget);
    const payload = {
      locale,
      shippingMethod: selectedShipping.code,
      items: cart.map((item) => ({variantId: item.variantId, quantity: item.quantity})),
      address: {
        customerName: String(data.get('customerName') ?? ''),
        email: String(data.get('email') ?? ''),
        phone: String(data.get('phone') ?? ''),
        addressLine1: String(data.get('addressLine1') ?? ''),
        addressLine2: String(data.get('addressLine2') ?? ''),
        city: String(data.get('city') ?? ''),
        region: String(data.get('region') ?? ''),
        postalCode: String(data.get('postalCode') ?? ''),
        countryCode: String(data.get('countryCode') ?? '')
      }
    };

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify(payload)
      });
      const result = await response.json() as {orderNumber?: string; confirmationToken?: string; error?: string};
      if (!response.ok || !result.orderNumber || !result.confirmationToken) {
        throw new Error(result.error ?? 'CHECKOUT_FAILED');
      }
      await clearCart();
      const token = encodeURIComponent(result.confirmationToken);
      router.push(`/${locale}/order/${result.orderNumber}?token=${token}`);
    } catch {
      setError(copy.error);
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.layout} onSubmit={(event) => void submit(event)}>
      <div className={styles.fields}>
        <section className={styles.section}>
          <h2>{copy.contact}</h2>
          <div className={styles.grid}>
            <Field label={copy.name} name="customerName" autoComplete="name" />
            <Field label={copy.email} name="email" type="email" autoComplete="email" />
            <Field label={copy.phone} name="phone" autoComplete="tel" />
          </div>
        </section>
        <section className={styles.section}>
          <h2>{copy.delivery}</h2>
          <div className={styles.grid}>
            <Field label={copy.address1} name="addressLine1" autoComplete="address-line1" wide />
            <Field label={copy.address2} name="addressLine2" autoComplete="address-line2" wide required={false} />
            <Field label={copy.city} name="city" autoComplete="address-level2" />
            <Field label={copy.region} name="region" autoComplete="address-level1" required={false} />
            <Field label={copy.postalCode} name="postalCode" autoComplete="postal-code" required={false} />
            <Field label={copy.countryCode} name="countryCode" autoComplete="country" minLength={2} maxLength={2} />
          </div>
        </section>
        <section className={styles.section}>
          <h2>{copy.shipping}</h2>
          {shippingLoading ? <p className={styles.shippingStatus}>{copy.refresh}</p> : null}
          {!shippingLoading && shippingMethods.length === 0 ? <p className={styles.shippingStatus}>{copy.shippingUnavailable}</p> : null}
          <div className={styles.shippingList}>
            {shippingMethods.map((method) => (
              <label className={styles.shippingOption} key={method.code}>
                <input
                  type="radio"
                  name="shippingMethod"
                  value={method.code}
                  checked={shippingCode === method.code}
                  onChange={() => setShippingCode(method.code)}
                />
                <span>
                  <strong>{method.name}</strong>
                  {method.description && <small>{method.description}</small>}
                </span>
                <strong>{money(locale, method.priceMinor, method.currency)}</strong>
              </label>
            ))}
          </div>
        </section>
      </div>

      <aside className={styles.summary}>
        <div className={styles.summaryLines}>
          {cart.map((item) => (
            <div className={styles.summaryLine} key={item.variantId}>
              <span>{item.name} · {item.colorLabel} · {item.size} × {item.quantity}</span>
              <strong>{money(locale, item.priceMinor * item.quantity, item.currency)}</strong>
            </div>
          ))}
        </div>
        <div className={styles.totalRow}><span>{copy.subtotal}</span><strong>{currency && subtotal !== null ? money(locale, subtotal, currency) : '—'}</strong></div>
        <div className={styles.totalRow}><span>{copy.shippingCost}</span><strong>{currency && shippingMinor !== null ? money(locale, shippingMinor, currency) : '—'}</strong></div>
        <div className={`${styles.totalRow} ${styles.grandTotal}`}><span>{copy.total}</span><strong>{currency && totalMinor !== null ? money(locale, totalMinor, currency) : '—'}</strong></div>
        {error && <p className={styles.error} role="alert">{error}</p>}
        <button className="button button--primary" type="submit" disabled={submitting || !currency || !selectedShipping}>
          {submitting ? copy.placingOrder : copy.placeOrder}
        </button>
      </aside>
    </form>
  );
}

type FieldProps = {
  label: string;
  name: string;
  type?: 'text' | 'email';
  autoComplete: string;
  wide?: boolean;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
};

function Field({label, name, type = 'text', autoComplete, wide = false, required = true, minLength, maxLength = 180}: FieldProps) {
  return (
    <label className={wide ? styles.wide : undefined}>
      <span>{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
      />
    </label>
  );
}
