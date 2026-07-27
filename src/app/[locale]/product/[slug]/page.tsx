import type {Metadata} from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {ProductPurchasePanel} from '@/components/catalog/product-purchase-panel';
import {SiteFooter} from '@/components/layout/site-footer';
import {SiteHeader} from '@/components/layout/site-header';
import {findActiveProduct} from '@/features/catalog/server/catalog-repository';
import {isAppLocale} from '@/i18n/routing';

export const dynamic = 'force-dynamic';

type ProductPageProps = {params: Promise<{locale: string; slug: string}>};

export async function generateMetadata({params}: ProductPageProps): Promise<Metadata> {
  const {locale, slug} = await params;
  if (!isAppLocale(locale)) return {};
  const product = await findActiveProduct(locale, slug);
  if (!product) return {};
  return {title: `${product.name} · DIVA`, description: product.description};
}

export default async function ProductPage({params}: ProductPageProps) {
  const {locale, slug} = await params;
  if (!isAppLocale(locale)) notFound();

  const product = await findActiveProduct(locale, slug);
  if (!product) notFound();

  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'Product'});

  return (
    <>
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
                <strong>{product.collection}</strong>
              </div>
            )}

            <ProductPurchasePanel
              locale={locale}
              productId={product.id}
              variants={product.variants}
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
