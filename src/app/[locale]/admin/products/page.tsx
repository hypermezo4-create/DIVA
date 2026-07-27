import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {ProductRowControls} from '@/components/admin/product-row-controls';
import {listAdminProducts} from '@/features/admin/repository';
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
  return {title: t('products.metaTitle'), robots: {index: false, follow: false}};
}

export default async function AdminProductsPage({params}: PageProps) {
  const {locale} = await params;
  if (!isAppLocale(locale)) notFound();
  setRequestLocale(locale);
  const [products, t] = await Promise.all([
    listAdminProducts(locale),
    getTranslations({locale, namespace: 'Admin'})
  ]);

  const controlLabels = {
    draft: t('productStatuses.draft'),
    active: t('productStatuses.active'),
    archived: t('productStatuses.archived'),
    newArrival: t('products.newArrival'),
    save: t('common.save'),
    saving: t('common.saving'),
    saved: t('common.saved'),
    error: t('common.error')
  };

  return (
    <>
      <header className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>DIVA · MERCHANDISING</span>
          <h1>{t('products.title')}</h1>
        </div>
        <p>{t('products.intro')}</p>
      </header>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>{t('products.catalog')}</h2>
            <p>{t('products.catalogNote', {count: products.length})}</p>
          </div>
        </div>
        {products.length === 0 ? (
          <div className={styles.empty}>{t('products.empty')}</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t('common.product')}</th>
                  <th>{t('products.audience')}</th>
                  <th>{t('products.price')}</th>
                  <th>{t('products.available')}</th>
                  <th>{t('products.offers')}</th>
                  <th>{t('common.status')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className={styles.primaryCell}>
                        <strong>{product.name}</strong>
                        <span>{product.slug} · {product.family}</span>
                      </div>
                    </td>
                    <td>{t(`audiences.${product.audience}`)}</td>
                    <td>
                      {product.lowestPriceMinor !== null && product.currency
                        ? money(locale, Number(product.lowestPriceMinor), product.currency)
                        : '—'}
                    </td>
                    <td>{new Intl.NumberFormat(locale).format(Number(product.availableUnits))}</td>
                    <td>
                      <span className={`${styles.badge} ${Number(product.offerVariants) > 0 ? styles.badgeGold : ''}`}>
                        {new Intl.NumberFormat(locale).format(Number(product.offerVariants))}
                      </span>
                    </td>
                    <td><span className={styles.badge}>{t(`productStatuses.${product.status}`)}</span></td>
                    <td>
                      <ProductRowControls
                        productId={product.id}
                        initialStatus={product.status}
                        initialNewArrival={product.newArrival}
                        labels={controlLabels}
                      />
                    </td>
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
