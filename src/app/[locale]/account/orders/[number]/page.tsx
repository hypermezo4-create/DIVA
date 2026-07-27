import type {Metadata} from 'next';
import Link from 'next/link';
import {headers} from 'next/headers';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound, redirect} from 'next/navigation';
import {OrderCancelButton} from '@/components/orders/order-cancel-button';
import {SiteFooter} from '@/components/layout/site-footer';
import {SiteHeader} from '@/components/layout/site-header';
import {findOrderForUser} from '@/features/orders/repository';
import {isAppLocale} from '@/i18n/routing';
import {getSessionFromHeaders} from '@/lib/session';
import styles from '../order-history.module.css';

type PageProps = {params: Promise<{locale: string; number: string}>};

function money(locale: string, minor: number, currency: string) {
  return new Intl.NumberFormat(locale, {style: 'currency', currency}).format(minor / 100);
}

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
  const {locale} = await params;
  if (!isAppLocale(locale)) return {};
  const t = await getTranslations({locale, namespace: 'Orders'});
  return {title: t('detailMetaTitle'), description: t('detailIntro'), robots: {index: false, follow: false}};
}

export default async function CustomerOrderPage({params}: PageProps) {
  const {locale, number} = await params;
  if (!isAppLocale(locale)) notFound();
  setRequestLocale(locale);

  const session = await getSessionFromHeaders(await headers());
  if (!session) redirect(`/${locale}/account`);

  const [order, t, orderT] = await Promise.all([
    findOrderForUser(session.user.id, number),
    getTranslations({locale, namespace: 'Orders'}),
    getTranslations({locale, namespace: 'Order'})
  ]);
  if (!order) notFound();

  const address = [
    order.addressLine1,
    order.addressLine2,
    order.city,
    order.region,
    order.postalCode,
    order.countryCode
  ].filter(Boolean).join(' · ');

  return (
    <>
      <SiteHeader locale={locale} />
      <main className={styles.shell}>
        <header className={styles.intro}>
          <p className="eyebrow">DIVA · ORDER</p>
          <h1>{order.number}</h1>
          <p>{t('detailIntro')}</p>
        </header>

        <section className={styles.detailCard}>
          <div className={styles.detailTop}>
            <div>
              <h2>{t('status')}</h2>
              <p className={styles.meta}>{orderT(`statuses.${order.status}`)}</p>
            </div>
            <span className={styles.status}>{orderT(`statuses.${order.status}`)}</span>
          </div>

          <div>
            <h2>{t('deliveryAddress')}</h2>
            <p className={styles.address}>{order.customerName}<br />{address}</p>
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

          <div className={styles.actions}>
            <Link href={`/${locale}/account/orders`} className="button button--primary">{t('backToOrders')}</Link>
            {order.status === 'pending_payment' && order.paymentStatus === 'pending' ? (
              <OrderCancelButton
                orderNumber={order.number}
                cancelLabel={t('cancel')}
                cancellingLabel={t('cancelling')}
                errorLabel={t('cancelError')}
              />
            ) : null}
          </div>
        </section>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
