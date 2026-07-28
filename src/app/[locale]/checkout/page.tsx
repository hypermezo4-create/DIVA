import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {CheckoutForm} from '@/components/checkout/checkout-form';
import {SiteFooter} from '@/components/layout/site-footer';
import {SiteHeader} from '@/components/layout/site-header';
import {isAppLocale} from '@/i18n/routing';
import styles from '@/components/commerce/commerce-page.module.css';

type PageProps = {params: Promise<{locale: string}>};

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
  const {locale} = await params;
  if (!isAppLocale(locale)) return {};
  const t = await getTranslations({locale, namespace: 'Checkout'});
  return {title: t('metaTitle'), description: t('intro')};
}

export default async function CheckoutPage({params}: PageProps) {
  const {locale} = await params;
  if (!isAppLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'Checkout'});

  return (
    <>
      <SiteHeader locale={locale} />
      <main id="main-content" className={styles.shell}>
        <header className={styles.intro}>
          <p className="eyebrow" translate="no">DIVA · CHECKOUT</p>
          <h1>{t('title')}</h1>
          <p>{t('intro')}</p>
        </header>
        <CheckoutForm
          locale={locale}
          copy={{
            empty: t('empty'),
            backToCart: t('backToCart'),
            contact: t('contact'),
            delivery: t('delivery'),
            name: t('name'),
            email: t('email'),
            phone: t('phone'),
            address1: t('address1'),
            address2: t('address2'),
            city: t('city'),
            region: t('region'),
            postalCode: t('postalCode'),
            countryCode: t('countryCode'),
            shipping: t('shipping'),
            shippingUnavailable: t('shippingUnavailable'),
            subtotal: t('subtotal'),
            shippingCost: t('shippingCost'),
            total: t('total'),
            placeOrder: t('placeOrder'),
            placingOrder: t('placingOrder'),
            refresh: t('refresh'),
            error: t('error')
          }}
        />
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
