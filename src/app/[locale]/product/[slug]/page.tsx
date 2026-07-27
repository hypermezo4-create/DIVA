import type {Metadata} from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {ProductPurchasePanel} from '@/components/catalog/product-purchase-panel';
import {SiteFooter} from '@/components/layout/site-footer';
import {SiteHeader} from '@/components/layout/site-header';
import {JsonLd} from '@/components/seo/json-ld';
import {findActiveProduct} from '@/features/catalog/server/catalog-repository';
import {isAppLocale} from '@/i18n/routing';
import {languageAlternates, localizedPath} from '@/lib/seo';
import {getSiteUrl} from '@/lib/site-url';

export const dynamic = 'force-dynamic';

type ProductPageProps = {params: Promise<{locale: string; slug: string}>};

export async function generateMetadata({params}: ProductPageProps): Promise<Metadata> {
  const {locale, slug} = await params;
  if (!isAppLocale(locale)) return {};
  const product = await findActiveProduct(locale, slug);
  if (!product) return {};

  const canonical = localizedPath(locale, `/product/${slug}`);
  const image = product.images[0]?.url;
  return {
    title: product.name,
    description: product.description,
    alternates: {canonical, languages: languageAlternates(`/product/${slug}`)},
    openGraph: {
      type: 'website',
      title: product.name,
      description: product.description,
      url: canonical,
      locale,
      images: image ? [{url: image, alt: product.name}] : undefined
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description,
      images: image ? [image] : undefined
    }
  };
}

export default async function ProductPage({params}: ProductPageProps) {
  const {locale, slug} = await params;
  if (!isAppLocale(locale)) notFound();

  const product = await findActiveProduct(locale, slug);
  if (!product) notFound();

  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'Product'});
  const siteUrl = getSiteUrl();
  const productUrl = new URL(localizedPath(locale, `/product/${slug}`), siteUrl).toString();
  const pricedVariants = product.variants.filter((variant) => variant.priceMinor !== null && variant.currency);
  const currencies = [...new Set(pricedVariants.map((variant) => variant.currency))];
  const currency = currencies.length === 1 ? currencies[0] : null;
  const prices = pricedVariants.map((variant) => variant.priceMinor).filter((price): price is number => price !== null);
  const lowestPrice = prices.length > 0 ? Math.min(...prices) : null;
  const highestPrice = prices.length > 0 ? Math.max(...prices) : null;

  return (
    <>
      <JsonLd
        value={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          description: product.description,
          sku: product.variants[0]?.sku,
          image: product.images.map((image) => image.url),
          brand: {'@type': 'Brand', name: 'DIVA'},
          url: productUrl,
          offers: currency && lowestPrice !== null && highestPrice !== null ? {
            '@type': 'AggregateOffer',
            priceCurrency: currency,
            lowPrice: (lowestPrice / 100).toFixed(2),
            highPrice: (highestPrice / 100).toFixed(2),
            offerCount: pricedVariants.length,
            url: productUrl
          } : undefined
        }}
      />
      <SiteHeader locale={locale} />
      <main className="product-page">
        <div className="product-breadcrumbs">
          <Link href={`/${locale}`}>{t('home')}</Link>
          <span>/</span>
          <Link href={`/${locale}/shop`}>{t('shop')}</Link>
          <span>/</span>
          <span>{product.name}</span>
        </div>

        <section className="product-detail">
          <div className="product-gallery">
            {product.images.map((image, index) => (
              <div className="product-gallery__frame" key={`${image.url}-${index}`}>
                <Image
                  src={image.url}
                  alt={image.altText ?? (index === 0 ? product.name : `${product.name} ${index + 1}`)}
                  fill
                  sizes="(max-width: 900px) 100vw, 55vw"
                  className="cover-image"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>

          <div className="product-detail__copy">
            <div>
              <p className="eyebrow">{product.subtitle}</p>
              <h1>{product.name}</h1>
              <p className="product-description">{product.description}</p>
            </div>

            {product.collection && (
              <div className="product-collection">
                <span>{t('collection')}</span>
                <strong>{product.collectionName ?? product.collection}</strong>
              </div>
            )}

            <ProductPurchasePanel
              locale={locale}
              productId={product.id}
              variants={product.variants}
              commerceEnabled={product.commerceEnabled}
              copy={{
                size: t('sizes'),
                color: t('colors'),
                priceFrom: t('priceFrom'),
                addToCart: t('addToCart'),
                adding: t('adding'),
                addToWishlist: t('addToWishlist'),
                removeFromWishlist: t('removeFromWishlist'),
                outOfStock: t('outOfStock'),
                chooseOptions: t('chooseOptions'),
                unavailable: t('unavailable'),
                added: t('added')
              }}
            />

            <div className="product-detail__actions">
              <Link href={`/${locale}/shop?category=${product.audience}`} className="button button--ghost">
                {t('moreFromCategory')}
              </Link>
              <Link href={`/${locale}/shop`} className="button button--ghost">
                {t('backToShop')}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
