import type {Metadata} from 'next';
import Link from 'next/link';
import {headers} from 'next/headers';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound, redirect} from 'next/navigation';
import {SiteFooter} from '@/components/layout/site-footer';
import {SiteHeader} from '@/components/layout/site-header';
import {listOrdersForUser} from '@/features/orders/repository';
import {isAppLocale} from '@/i18n/routing';
import {getSessionFromHeaders} from '@/lib/session';
import styles from './order-history.module.css';

type PageProps = {params: Promise<{locale: string}>};

function money(locale: string, minor: number, currency: string) {
  return new Intl.NumberFormat(locale, {style: 'currency', currency}).format(minor / 100);
}

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
  const {locale} = await params;
  if (!isAppLocale(locale)) return {};
  const t = await getTranslations({locale, namespace: 'Orders'});
  return {title: t('metaTitle'), description: t('intro'), robots: {index: false, follow: false}};
}

export default async function OrdersPage({params}: PageProps) {
  const {locale} = await params;
  if (!isAppLocale(locale)) notFound();
  setRequestLocale(locale);

  const session = await getSessionFromHeaders(await headers());
  if (!session) redirect(`/${locale}/account`);

  const [orders, t, orderT] = await Promise.all([
    listOrdersForUser(session.user.id),
    getTranslations({locale, namespace: 'Orders'}),
    getTranslations({locale, namespace: 'Order'})
  ]);

  return (
    <>
      <SiteHeader locale={locale} />
      <main className={styles.shell}>
        <header className={styles.intro}>
          <p className="eyebrow">DIVA · ORDERS</p>
          <h1>{t('title')}</h1>
          <p>{t('intro')}</p>
        </header>

        {orders.length === 0 ? (
          <div className={styles.empty}>
            <p>{t('empty')}</p>
            <Link href={`/${locale}/shop`} className="button button--primary">{t('shop')}</Link>
          </div>
        ) : (
          <div className={styles.list}>
            {orders.map((order) => (
              <Link className={styles.card} href={`/${locale}/account/orders/${order.number}`} key={order.id}>
                <div>
                  <h2>{order.number}</h2>
                  <p className={styles.meta}>{new Intl.DateTimeFormat(locale, {dateStyle: 'medium'}).format(order.createdAt)}</p>
                </div>
                <strong>{money(locale, order.totalMinor, order.currency)}</strong>
                <span className={styles.status}>{orderT(`statuses.${order.status}`)}</span>
              </Link>
            ))}
          </div>
        )}
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
