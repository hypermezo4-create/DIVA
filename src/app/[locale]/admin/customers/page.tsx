import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {listAdminCustomers} from '@/features/admin/repository';
import {isAppLocale} from '@/i18n/routing';
import styles from '@/components/admin/admin-shell.module.css';

type PageProps = {params: Promise<{locale: string}>};

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
  const {locale} = await params;
  if (!isAppLocale(locale)) return {};
  const t = await getTranslations({locale, namespace: 'Admin'});
  return {title: t('customers.metaTitle'), robots: {index: false, follow: false}};
}

export default async function AdminCustomersPage({params}: PageProps) {
  const {locale} = await params;
  if (!isAppLocale(locale)) notFound();
  setRequestLocale(locale);
  const [customers, t] = await Promise.all([
    listAdminCustomers(),
    getTranslations({locale, namespace: 'Admin'})
  ]);

  return (
    <>
      <header className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>DIVA · CLIENTELING</span>
          <h1>{t('customers.title')}</h1>
        </div>
        <p>{t('customers.intro')}</p>
      </header>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>{t('customers.directory')}</h2>
            <p>{t('customers.directoryNote', {count: customers.length})}</p>
          </div>
        </div>
        {customers.length === 0 ? (
          <div className={styles.empty}>{t('customers.empty')}</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t('common.customer')}</th>
                  <th>{t('customers.role')}</th>
                  <th>{t('customers.orders')}</th>
                  <th>{t('customers.joined')}</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <div className={styles.primaryCell}>
                        <strong>{customer.name}</strong>
                        <span>{customer.email}</span>
                      </div>
                    </td>
                    <td><span className={`${styles.badge} ${customer.role === 'admin' ? styles.badgeGold : ''}`}>{t(`roles.${customer.role === 'admin' ? 'admin' : 'customer'}`)}</span></td>
                    <td>{new Intl.NumberFormat(locale).format(Number(customer.ordersCount))}</td>
                    <td>{new Intl.DateTimeFormat(locale, {dateStyle: 'medium'}).format(customer.createdAt)}</td>
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
