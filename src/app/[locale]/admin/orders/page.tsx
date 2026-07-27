import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {OrderRowControls} from '@/components/admin/order-row-controls';
import {listAdminOrders} from '@/features/admin/repository';
import {isAppLocale} from '@/i18n/routing';
import styles from '@/components/admin/admin-shell.module.css';

type PageProps = {params: Promise<{locale: string}>};
type Target = 'cancelled' | 'processing' | 'shipped' | 'delivered';

function money(locale: string, minor: number, currency: string) {
  return new Intl.NumberFormat(locale, {style: 'currency', currency}).format(minor / 100);
}

function targetFor(status: string, paymentStatus: string): Target | null {
  if (status === 'pending_payment' && paymentStatus === 'pending') return 'cancelled';
  if (paymentStatus !== 'paid') return null;
  if (status === 'confirmed') return 'processing';
  if (status === 'processing') return 'shipped';
  if (status === 'shipped') return 'delivered';
  return null;
}

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
  const {locale} = await params;
  if (!isAppLocale(locale)) return {};
  const t = await getTranslations({locale, namespace: 'Admin'});
  return {title: t('orders.metaTitle'), robots: {index: false, follow: false}};
}

export default async function AdminOrdersPage({params}: PageProps) {
  const {locale} = await params;
  if (!isAppLocale(locale)) notFound();
  setRequestLocale(locale);
  const [orders, t, orderT] = await Promise.all([
    listAdminOrders(),
    getTranslations({locale, namespace: 'Admin'}),
    getTranslations({locale, namespace: 'Order'})
  ]);

  return (
    <>
      <header className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>DIVA · FULFILMENT</span>
          <h1>{t('orders.title')}</h1>
        </div>
        <p>{t('orders.intro')}</p>
      </header>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>{t('orders.queue')}</h2>
            <p>{t('orders.queueNote', {count: orders.length})}</p>
          </div>
        </div>
        {orders.length === 0 ? (
          <div className={styles.empty}>{t('orders.empty')}</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t('common.order')}</th>
                  <th>{t('common.customer')}</th>
                  <th>{t('common.status')}</th>
                  <th>{t('common.payment')}</th>
                  <th>{t('orders.shipping')}</th>
                  <th>{t('common.total')}</th>
                  <th>{t('common.date')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const target = targetFor(order.status, order.paymentStatus);
                  return (
                    <tr key={order.id}>
                      <td><strong>{order.number}</strong></td>
                      <td>
                        <div className={styles.primaryCell}>
                          <strong>{order.customerName}</strong>
                          <span>{order.email}</span>
                        </div>
                      </td>
                      <td><span className={`${styles.badge} ${order.status === 'pending_payment' ? styles.badgeGold : ''}`}>{orderT(`statuses.${order.status}`)}</span></td>
                      <td>{t(`paymentStatuses.${order.paymentStatus}`)}</td>
                      <td>{order.shippingMethod}</td>
                      <td>{money(locale, order.totalMinor, order.currency)}</td>
                      <td>{new Intl.DateTimeFormat(locale, {dateStyle: 'medium'}).format(order.createdAt)}</td>
                      <td>
                        <OrderRowControls
                          orderId={order.id}
                          target={target}
                          label={target ? t(`orders.actions.${target}`) : ''}
                          working={t('common.saving')}
                          saved={t('common.saved')}
                          error={t('common.error')}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
