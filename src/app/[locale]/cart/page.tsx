import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {CartView} from '@/components/commerce/cart-view';
import {SiteFooter} from '@/components/layout/site-footer';
import {SiteHeader} from '@/components/layout/site-header';
import {isAppLocale} from '@/i18n/routing';
import styles from '@/components/commerce/commerce-page.module.css';

type PageProps = {params: Promise<{locale: string}>};

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
  const {locale} = await params;
  if (!isAppLocale(locale)) return {};
  const t = await getTranslations({locale, namespace: 'Cart'});
  return {title: t('metaTitle'), description: t('intro')};
}

export default async function CartPage({params}: PageProps) {
  const {locale} = await params;
  if (!isAppLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'Cart'});

  return (
    <>
      <SiteHeader locale={locale} />
      <main id="main-content" className={styles.shell}>
        <header className={styles.intro}>
          <p className="eyebrow" translate="no">DIVA · SHOPPING BAG</p>
          <h1>{t('title')}</h1>
          <p>{t('intro')}</p>
        </header>
        <CartView
          locale={locale}
          copy={{
            empty: t('empty'),
            continueShopping: t('continueShopping'),
            quantity: t('quantity'),
            remove: t('remove'),
            subtotal: t('subtotal'),
            stockTemplate: String(t.raw('stock')),
            checkout: t('checkout'),
            checkoutSoon: t('checkoutSoon'),
            refreshing: t('refreshing')
          }}
        />
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
