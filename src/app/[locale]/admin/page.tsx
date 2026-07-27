import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {getAdminDashboard} from '@/features/admin/repository';
import {isAppLocale} from '@/i18n/routing';
import styles from '@/components/admin/admin-shell.module.css';

type PageProps = {params: Promise<{locale: string}>};

function money(locale: string, minor: number, currency: string) {
  return new Intl.NumberFormat(locale, {style: 'currency', currency}).format(minor / 100);
}

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
  const {locale} = await params;
  if (!isAppLocale(locale)) return {};
  const t = await getTranslations({locale, namespace: 'Admin'});
  return {title: t('dashboard.metaTitle'), robots: {index: false, follow: false}};
}

export default async function AdminDashboardPage({params}: PageProps) {
  const {locale} = await params;
  if (!isAppLocale(locale)) notFound();
  setRequestLocale(locale);

  const [data, t, orderT] = await Promise.all([
    getAdminDashboard(),
    getTranslations({locale, namespace: 'Admin'}),
    getTranslations({locale, namespace: 'Order'})
  ]);

  const metrics = [
    [t('dashboard.activeProducts'), data.activeProducts],
    [t('dashboard.availableUnits'), data.availableUnits],
    [t('dashboard.offerVariants'), data.offerVariants],
    [t('dashboard.customers'), data.customers],
    [t('dashboard.pendingOrders'), data.pendingOrders],
    [t('dashboard.paidOrders'), data.paidOrders]
  ] as const;

  return (
    <>
      <header className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>DIVA · COMMAND CENTER</span>
          <h1>{t('dashboard.title')}</h1>
        </div>
        <p>{t('dashboard.intro')}</p>
      </header>

      <section className={styles.metrics} aria-label={t('dashboard.metricsLabel')}>
        {metrics.map(([label, value]) => (
          <article className={styles.metric} key={label}>
            <span>{label}</span>
            <strong>{new Intl.NumberFormat(locale).format(value)}</strong>
          </article>
        ))}
      </section>

      <section className={styles.twoColumns}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>{t('dashboard.revenue')}</h2>
              <p>{t('dashboard.revenueNote')}</p>
            </div>
          </div>
          {data.paidRevenueByCurrency.length === 0 ? (
            <div className={styles.empty}>{t('dashboard.noRevenue')}</div>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead><tr><th>{t('common.currency')}</th><th>{t('dashboard.revenue')}</th></tr></thead>
                <tbody>
                  {data.paidRevenueByCurrency.map((row) => (
                    <tr key={row.currency}>
                      <td>{row.currency}</td>
                      <td><strong>{money(locale, row.revenueMinor, row.currency)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>{t('dashboard.operations')}</h2>
              <p>{t('dashboard.operationsNote')}</p>
            </div>
          </div>
          <div className={styles.empty}>
            {t('dashboard.operationsSummary', {
              products: data.activeProducts,
              orders: data.pendingOrders,
              units: data.availableUnits
            })}
          </div>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>{t('dashboard.recentOrders')}</h2>
            <p>{t('dashboard.recentOrdersNote')}</p>
          </div>
        </div>
        {data.recentOrders.length === 0 ? (
          <div className={styles.empty}>{t('dashboard.noOrders')}</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t('common.order')}</th>
                  <th>{t('common.customer')}</th>
                  <th>{t('common.status')}</th>
                  <th>{t('common.payment')}</th>
                  <th>{t('common.total')}</th>
                  <th>{t('common.date')}</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td><strong>{order.number}</strong></td>
                    <td>{order.customerName}</td>
                    <td><span className={`${styles.badge} ${order.status === 'pending_payment' ? styles.badgeGold : ''}`}>{orderT(`statuses.${order.status}`)}</span></td>
                    <td>{t(`paymentStatuses.${order.paymentStatus}`)}</td>
                    <td>{money(locale, order.totalMinor, order.currency)}</td>
                    <td>{new Intl.DateTimeFormat(locale, {dateStyle: 'medium'}).format(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
