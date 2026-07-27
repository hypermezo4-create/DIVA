import type {Metadata} from 'next';
import Link from 'next/link';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {SiteFooter} from '@/components/layout/site-footer';
import {SiteHeader} from '@/components/layout/site-header';
import {findOrderConfirmation} from '@/features/orders/repository';
import {isAppLocale} from '@/i18n/routing';
import styles from './order-confirmation.module.css';

type PageProps = {params: Promise<{locale: string; number: string}>};

function money(locale: string, minor: number, currency: string) {
  return new Intl.NumberFormat(locale, {style: 'currency', currency}).format(minor / 100);
}

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
  const {locale} = await params;
  if (!isAppLocale(locale)) return {};
  const t = await getTranslations({locale, namespace: 'Order'});
  return {title: t('metaTitle'), description: t('intro')};
}

export default async function OrderPage({params}: PageProps) {
  const {locale, number} = await params;
  if (!isAppLocale(locale)) notFound();
  const order = await findOrderConfirmation(number);
  if (!order) notFound();

  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'Order'});

  return (
    <>
      <SiteHeader locale={locale} />
      <main className={styles.shell}>
        <section className={styles.hero}>
          <p className="eyebrow">DIVA · ORDER</p>
          <h1>{t('title')}</h1>
          <p>{t('intro')}</p>
          <strong>{order.number}</strong>
        </section>

        <section className={styles.card}>
          <div className={styles.statusRow}>
            <span>{t('status')}</span>
            <strong>{t(`statuses.${order.status}`)}</strong>
          </div>
          <div className={styles.items}>
            {order.items.map((item) => (
              <div className={styles.item} key={item.id}>
                <div>
                  <h2>{item.productName}</h2>
                  <p>{item.colorLabel} · {item.sizeLabel} · × {item.quantity}</p>
                </div>
                <strong>{money(locale, item.lineTotalMinor, order.currency)}</strong>
              </div>
            ))}
          </div>
          <div className={styles.totalRow}><span>{t('subtotal')}</span><strong>{money(locale, order.subtotalMinor, order.currency)}</strong></div>
          <div className={styles.totalRow}><span>{t('shipping')}</span><strong>{money(locale, order.shippingMinor, order.currency)}</strong></div>
          <div className={`${styles.totalRow} ${styles.grandTotal}`}><span>{t('total')}</span><strong>{money(locale, order.totalMinor, order.currency)}</strong></div>
          <p className={styles.note}>{t('paymentNote')}</p>
          <Link href={`/${locale}/shop`} className="button button--primary">{t('continueShopping')}</Link>
        </section>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
