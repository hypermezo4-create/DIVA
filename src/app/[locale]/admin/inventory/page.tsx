import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {InventoryRowControls} from '@/components/admin/inventory-row-controls';
import {listAdminInventory} from '@/features/admin/repository';
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
  return {title: t('inventory.metaTitle'), robots: {index: false, follow: false}};
}

export default async function AdminInventoryPage({params}: PageProps) {
  const {locale} = await params;
  if (!isAppLocale(locale)) notFound();
  setRequestLocale(locale);
  const [variants, t] = await Promise.all([
    listAdminInventory(locale),
    getTranslations({locale, namespace: 'Admin'})
  ]);

  const labels = {
    stock: t('inventory.stockInput'),
    priceMinor: t('inventory.priceMinor'),
    compareAtMinor: t('inventory.compareAtMinor'),
    active: t('inventory.active'),
    saveStock: t('inventory.saveStock'),
    savePricing: t('inventory.savePricing'),
    saving: t('common.saving'),
    saved: t('common.saved'),
    error: t('common.error')
  };

  return (
    <>
      <header className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>DIVA · STOCK DESK</span>
          <h1>{t('inventory.title')}</h1>
        </div>
        <p>{t('inventory.intro')}</p>
      </header>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>{t('inventory.variants')}</h2>
            <p>{t('inventory.variantsNote', {count: variants.length})}</p>
          </div>
        </div>
        {variants.length === 0 ? (
          <div className={styles.empty}>{t('inventory.empty')}</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t('common.product')}</th>
                  <th>{t('inventory.variant')}</th>
                  <th>{t('inventory.stock')}</th>
                  <th>{t('inventory.price')}</th>
                  <th>{t('inventory.offer')}</th>
                  <th>{t('common.status')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((variant) => {
                  const isOffer = variant.priceMinor !== null
                    && variant.compareAtMinor !== null
                    && variant.compareAtMinor > variant.priceMinor;
                  return (
                    <tr key={variant.variantId}>
                      <td>
                        <div className={styles.primaryCell}>
                          <strong>{variant.productName}</strong>
                          <span>{variant.sku}</span>
                        </div>
                      </td>
                      <td>{variant.color} · {variant.size}</td>
                      <td>
                        <div className={styles.primaryCell}>
                          <strong>{new Intl.NumberFormat(locale).format(variant.available)}</strong>
                          <span>{t('inventory.stockBreakdown', {onHand: variant.onHand, reserved: variant.reserved})}</span>
                        </div>
                      </td>
                      <td>{variant.priceMinor !== null && variant.currency ? money(locale, variant.priceMinor, variant.currency) : '—'}</td>
                      <td>
                        {isOffer && variant.currency && variant.compareAtMinor !== null
                          ? <span className={`${styles.badge} ${styles.badgeGold}`}>{money(locale, variant.compareAtMinor, variant.currency)}</span>
                          : <span className={styles.muted}>—</span>}
                      </td>
                      <td><span className={styles.badge}>{variant.active ? t('inventory.active') : t('inventory.inactive')}</span></td>
                      <td>
                        <InventoryRowControls
                          variantId={variant.variantId}
                          initialOnHand={variant.onHand}
                          initialPriceMinor={variant.priceMinor}
                          initialCompareAtMinor={variant.compareAtMinor}
                          initialActive={variant.active}
                          labels={labels}
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
