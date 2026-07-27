import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {WishlistView} from '@/components/commerce/wishlist-view';
import {SiteFooter} from '@/components/layout/site-footer';
import {SiteHeader} from '@/components/layout/site-header';
import {isAppLocale} from '@/i18n/routing';
import styles from '@/components/commerce/commerce-page.module.css';

type PageProps = {params: Promise<{locale: string}>};

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
  const {locale} = await params;
  if (!isAppLocale(locale)) return {};
  const t = await getTranslations({locale, namespace: 'Wishlist'});
  return {title: t('metaTitle'), description: t('intro')};
}

export default async function WishlistPage({params}: PageProps) {
  const {locale} = await params;
  if (!isAppLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'Wishlist'});

  return (
    <>
      <SiteHeader locale={locale} />
      <main className={styles.shell}>
        <header className={styles.intro}>
          <p className="eyebrow">DIVA · SAVED EDIT</p>
          <h1>{t('title')}</h1>
          <p>{t('intro')}</p>
        </header>
        <WishlistView locale={locale} copy={{empty: t('empty'), continueShopping: t('continueShopping'), remove: t('remove')}} />
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
