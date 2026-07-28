import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {CatalogDiscovery} from '@/components/catalog/catalog-discovery';
import {ProductCard} from '@/components/catalog/product-card';
import {SiteFooter} from '@/components/layout/site-footer';
import {SiteHeader} from '@/components/layout/site-header';
import {listActiveProducts} from '@/features/catalog/server/catalog-repository';
import {
  catalogFilters,
  isCatalogFilter,
  isCatalogSort,
  type CatalogFilter,
  type CatalogSort
} from '@/features/catalog/types';
import {isAppLocale} from '@/i18n/routing';
import {languageAlternates, localizedPath} from '@/lib/seo';

export const dynamic = 'force-dynamic';

type ShopPageProps = {
  params: Promise<{locale: string}>;
  searchParams: Promise<{category?: string; sort?: string}>;
};

type CatalogListItem = Awaited<ReturnType<typeof listActiveProducts>>[number];

function isOffer(product: CatalogListItem) {
  return product.priceMinor !== null
    && product.compareAtMinor !== null
    && product.compareAtMinor > product.priceMinor;
}

function matchesFilter(product: CatalogListItem, filter: CatalogFilter) {
  if (filter === 'all') return true;
  if (filter === 'offers') return isOffer(product);
  return product.audience === filter;
}

function sortProducts(products: CatalogListItem[], sort: CatalogSort, locale: string) {
  if (sort === 'featured') return products;

  return [...products].sort((left, right) => {
    if (sort === 'newest') {
      const newArrivalOrder = Number(right.newArrival) - Number(left.newArrival);
      if (newArrivalOrder !== 0) return newArrivalOrder;
    }

    if (sort === 'price-asc' || sort === 'price-desc') {
      if (left.priceMinor === null && right.priceMinor !== null) return 1;
      if (left.priceMinor !== null && right.priceMinor === null) return -1;
      if (left.priceMinor !== null && right.priceMinor !== null && left.priceMinor !== right.priceMinor) {
        return sort === 'price-asc'
          ? left.priceMinor - right.priceMinor
          : right.priceMinor - left.priceMinor;
      }
    }

    return left.name.localeCompare(right.name, locale);
  });
}

export async function generateMetadata({params}: ShopPageProps): Promise<Metadata> {
  const {locale} = await params;
  if (!isAppLocale(locale)) return {};
  const t = await getTranslations({locale, namespace: 'Shop'});
  const canonical = localizedPath(locale, '/shop');
  return {
    title: t('metaTitle'),
    description: t('description'),
    alternates: {canonical, languages: languageAlternates('/shop')},
    openGraph: {title: t('metaTitle'), description: t('description'), url: canonical, locale}
  };
}

export default async function ShopPage({params, searchParams}: ShopPageProps) {
  const {locale} = await params;
  const {category, sort} = await searchParams;
  if (!isAppLocale(locale)) notFound();

  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'Shop'});
  const activeFilter: CatalogFilter = isCatalogFilter(category) ? category : 'all';
  const activeSort: CatalogSort = isCatalogSort(sort) ? sort : 'featured';
  const allProducts = await listActiveProducts(locale, 'all');
  const filteredProducts = allProducts.filter((product) => matchesFilter(product, activeFilter));
  const products = sortProducts(filteredProducts, activeSort, locale);
  const filterLabels = Object.fromEntries(
    catalogFilters.map((filter) => [filter, t(`filters.${filter}`)])
  ) as Record<CatalogFilter, string>;
  const filterCounts = Object.fromEntries(
    catalogFilters.map((filter) => [filter, allProducts.filter((product) => matchesFilter(product, filter)).length])
  ) as Record<CatalogFilter, number>;

  return (
    <>
      <SiteHeader locale={locale} />
      <main id="main-content" className="shop-page">
        <header className="shop-intro">
          <p className="eyebrow" translate="no">DIVA · PREMIUM MIRROR</p>
          <div className="shop-intro__copy">
            <h1>{t('title')}</h1>
            <p>{t('description')}</p>
          </div>
        </header>

        <CatalogDiscovery
          locale={locale}
          activeFilter={activeFilter}
          activeSort={activeSort}
          labels={filterLabels}
          counts={filterCounts}
          resultCount={products.length}
        />

        <div className="catalog-result-meta" aria-live="polite">
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
              offerLabel={t('offerBadge')}
              soldOutLabel={t('soldOut')}
            />
          ))}
        </div>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}