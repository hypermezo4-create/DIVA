import Image from 'next/image';
import Link from 'next/link';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {SiteFooter} from '@/components/layout/site-footer';
import {SiteHeader} from '@/components/layout/site-header';
import {isAppLocale} from '@/i18n/routing';

const products = [
  {
    name: 'Milano Court 01',
    categoryKey: 'sneaker',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=86'
  },
  {
    name: 'Aurelia 08',
    categoryKey: 'heel',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=86'
  },
  {
    name: 'Noir Loafer 03',
    categoryKey: 'loafer',
    image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=1200&q=86'
  }
] as const;

type ShopPageProps = {params: Promise<{locale: string}>};

export default async function ShopPage({params}: ShopPageProps) {
  const {locale} = await params;

  if (!isAppLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'Shop'});

  return (
    <>
      <SiteHeader locale={locale} />
      <main className="shop-page">
        <header className="shop-intro">
          <p className="eyebrow">DIVA · PREMIUM MIRROR</p>
          <h1>{t('title')}</h1>
          <p>{t('description')}</p>
        </header>

        <div className="product-grid">
          {products.map((product) => (
            <article className="product-card" key={product.name}>
              <div className="product-card__image">
                <Image src={product.image} alt="" fill sizes="(max-width: 800px) 100vw, 33vw" className="cover-image" />
              </div>
              <p>{t(`categories.${product.categoryKey}`)}</p>
              <h2>{product.name}</h2>
              <span>{t('preview')}</span>
            </article>
          ))}
        </div>

        <Link href={`/${locale}`} className="button button--ghost shop-back">
          {t('back')}
        </Link>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
