import type {Metadata} from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {SiteFooter} from '@/components/layout/site-footer';
import {SiteHeader} from '@/components/layout/site-header';
import {catalogProducts, findCatalogProduct, localizeProduct} from '@/features/catalog/catalog';
import {isAppLocale, locales} from '@/i18n/routing';

type ProductPageProps = {params: Promise<{locale: string; slug: string}>};

export function generateStaticParams() {
  return catalogProducts.flatMap((product) => locales.map((locale) => ({locale, slug: product.slug})));
}

export async function generateMetadata({params}: ProductPageProps): Promise<Metadata> {
  const {locale, slug} = await params;
  if (!isAppLocale(locale)) return {};

  const product = findCatalogProduct(slug);
  if (!product) return {};

  const copy = localizeProduct(product, locale);
  return {title: `${copy.name} · DIVA`, description: copy.description};
}

export default async function ProductPage({params}: ProductPageProps) {
  const {locale, slug} = await params;

  if (!isAppLocale(locale)) {
    notFound();
  }

  const product = findCatalogProduct(slug);
  if (!product) {
    notFound();
  }

  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'Product'});
  const copy = localizeProduct(product, locale);

  return (
    <>
      <SiteHeader locale={locale} />
      <main className="product-page">
        <div className="product-breadcrumbs">
          <Link href={`/${locale}`}>{t('home')}</Link>
          <span>/</span>
          <Link href={`/${locale}/shop`}>{t('shop')}</Link>
          <span>/</span>
          <span>{copy.name}</span>
        </div>

        <section className="product-detail">
          <div className="product-gallery">
            {product.gallery.map((image, index) => (
              <div className="product-gallery__frame" key={image}>
                <Image
                  src={image}
                  alt={index === 0 ? copy.name : `${copy.name} ${index + 1}`}
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
              <p className="eyebrow">{copy.subtitle}</p>
              <h1>{copy.name}</h1>
              <p className="product-description">{copy.description}</p>
            </div>

            <div className="product-spec">
              <span>{t('sizes')}</span>
              <div className="product-sizes" aria-label={t('sizes')}>
                {product.sizes.map((size) => <span key={size}>{size}</span>)}
              </div>
            </div>

            <div className="product-spec">
              <span>{t('colors')}</span>
              <div className="product-colors">
                {product.colors.map((color) => (
                  <span className="product-color" key={color.hex}>
                    <i style={{backgroundColor: color.hex}} aria-hidden="true" />
                    {color.label[locale]}
                  </span>
                ))}
              </div>
            </div>

            {product.collection && (
              <div className="product-collection">
                <span>{t('collection')}</span>
                <strong>{t(`collections.${product.collection}`)}</strong>
              </div>
            )}

            <div className="product-detail__actions">
              <Link href={`/${locale}/shop?category=${product.audience}`} className="button button--primary">
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
