import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {CatalogFilterNav} from '@/components/catalog/catalog-filter-nav';
import {ProductCard} from '@/components/catalog/product-card';
import {SiteFooter} from '@/components/layout/site-footer';
import {SiteHeader} from '@/components/layout/site-header';
import {isCatalogFilter} from '@/features/catalog/catalog';
import {listActiveProducts} from '@/features/catalog/server/catalog-repository';
import {catalogFilters, type CatalogFilter} from '@/features/catalog/types';
import {isAppLocale} from '@/i18n/routing';

type ShopPageProps = {
  params: Promise<{locale: string}>;
  searchParams: Promise<{category?: string}>;
};

export async function generateMetadata({params}: ShopPageProps): Promise<Metadata> {
  const {locale} = await params;
  if (!isAppLocale(locale)) return {};
  const t = await getTranslations({locale, namespace: 'Shop'});
  return {title: t('metaTitle'), description: t('description')};
}

export default async function ShopPage({params, searchParams}: ShopPageProps) {
  const {locale} = await params;
  const {category} = await searchParams;
  if (!isAppLocale(locale)) notFound();

  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'Shop'});
  const activeFilter: CatalogFilter = isCatalogFilter(category) ? category : 'all';
  const products = await listActiveProducts(locale, activeFilter);
  const filterLabels = Object.fromEntries(
    catalogFilters.map((filter) => [filter, t(`filters.${filter}`)])
  ) as Record<CatalogFilter, string>;

  return (
    <>
      <SiteHeader locale={locale} />
      <main className="shop-page">
        <header className="shop-intro">
          <p className="eyebrow">DIVA · PREMIUM MIRROR</p>
          <h1>{t('title')}</h1>
          <p>{t('description')}</p>
        </header>
        <CatalogFilterNav locale={locale} active={activeFilter} labels={filterLabels} />
        <div className="catalog-result-meta">
          <span>{t('resultCount', {count: products.length})}</span>
          <span>{filterLabels[activeFilter]}</span>
        </div>
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              locale={locale}
              product={product}
              newLabel={t('newBadge')}
              soldOutLabel={t('soldOut')}
            />
          ))}
        </div>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
