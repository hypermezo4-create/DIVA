import type {Metadata} from 'next';
import Link from 'next/link';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {ProductCard} from '@/components/catalog/product-card';
import {Hero} from '@/components/home/hero';
import {OfferSpotlight} from '@/components/home/offer-spotlight';
import {SignatureGrid} from '@/components/home/signature-grid';
import {ValueStrip} from '@/components/home/value-strip';
import {SiteFooter} from '@/components/layout/site-footer';
import {SiteHeader} from '@/components/layout/site-header';
import {JsonLd} from '@/components/seo/json-ld';
import {listActiveProducts} from '@/features/catalog/server/catalog-repository';
import type {StorefrontContentKey} from '@/features/content/definitions';
import {getStorefrontContent} from '@/features/content/repository';
import {isAppLocale} from '@/i18n/routing';
import {languageAlternates, localizedPath} from '@/lib/seo';
import {getSiteUrl} from '@/lib/site-url';

type PageProps = {params: Promise<{locale: string}>};

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
  const {locale} = await params;
  if (!isAppLocale(locale)) return {};

  const t = await getTranslations({locale, namespace: 'Metadata'});
  const canonical = localizedPath(locale);
  return {
    title: t('title'),
    description: t('description'),
    alternates: {canonical, languages: languageAlternates()},
    openGraph: {title: t('title'), description: t('description'), url: canonical, locale}
  };
}

export default async function HomePage({params}: PageProps) {
  const {locale} = await params;
  if (!isAppLocale(locale)) notFound();

  setRequestLocale(locale);
  const [t, navigationT, shopT, overrides, products] = await Promise.all([
    getTranslations({locale, namespace: 'Home'}),
    getTranslations({locale, namespace: 'Navigation'}),
    getTranslations({locale, namespace: 'Shop'}),
    getStorefrontContent(locale),
    listActiveProducts(locale, 'all')
  ]);

  const content = (key: StorefrontContentKey, fallback: string) => overrides.get(key) ?? fallback;
  const siteUrl = getSiteUrl();
  const localizedUrl = new URL(localizedPath(locale), siteUrl).toString();
  const categoryImage = (category: 'women' | 'men' | 'kids') => products.find((product) => product.audience === category)?.image ?? null;
  const offerProduct = products.find((product) => product.priceMinor !== null
    && product.compareAtMinor !== null
    && product.compareAtMinor > product.priceMinor) ?? null;
  const featured = products.filter((product) => product.newArrival).slice(0, 4);
  const featuredProducts = featured.length >= 3 ? featured : products.slice(0, 4);
  const heroItems = [...products]
    .sort((a, b) => Number(b.newArrival) - Number(a.newArrival))
    .filter((product) => product.image)
    .slice(0, 4)
    .map((product) => ({
      id: product.id,
      slug: product.slug,
      image: product.image,
      name: product.name,
      subtitle: product.subtitle,
      priceMinor: product.priceMinor,
      compareAtMinor: product.compareAtMinor,
      currency: product.currency
    }));

  const signatureItems = ['women', 'men', 'kids'].map((key) => ({
    slug: key,
    title: content(`home.categories.${key}.title` as StorefrontContentKey, t(`categories.${key}.title`)),
    label: t(`categories.${key}.label`),
    image: categoryImage(key as 'women' | 'men' | 'kids')
  }));
  signatureItems.push({
    slug: 'offers',
    title: offerProduct?.name ?? navigationT('offers'),
    label: navigationT('offers'),
    image: offerProduct?.image ?? null
  });

  const values = ['craft', 'comfort', 'service'].map((key) => ({
    title: content(`home.values.${key}.title` as StorefrontContentKey, t(`values.${key}.title`)),
    text: content(`home.values.${key}.text` as StorefrontContentKey, t(`values.${key}.text`))
  }));

  return (
    <>
      <JsonLd
        value={[
          {'@context': 'https://schema.org', '@type': 'Organization', name: 'DIVA', url: siteUrl.origin},
          {'@context': 'https://schema.org', '@type': 'WebSite', name: 'DIVA', url: localizedUrl, inLanguage: locale}
        ]}
      />
      <SiteHeader locale={locale} />
      <main>
        <Hero
          locale={locale}
          copy={{
            kicker: content('home.hero.kicker', t('hero.kicker')),
            title: content('home.hero.title', t('hero.title')),
            description: content('home.hero.description', t('hero.description')),
            primary: content('home.hero.primary', t('hero.primary')),
            secondary: content('home.hero.secondary', t('hero.secondary')),
            edition: content('home.hero.edition', t('hero.edition'))
          }}
          items={heroItems}
        />

        <ValueStrip label={t('valuesLabel')} items={values} />

        <SignatureGrid
          locale={locale}
          title={content('home.signatureTitle', t('signatureTitle'))}
          items={signatureItems}
        />

        {offerProduct && (
          <OfferSpotlight
            locale={locale}
            product={offerProduct}
            eyebrow={navigationT('offers')}
            action={navigationT('shop')}
          />
        )}

        <section className="home-featured-section">
          <div className="home-featured-heading">
            <div>
              <p className="eyebrow">{navigationT('new')}</p>
              <h2>{shopT('title')}</h2>
            </div>
            <Link href={`/${locale}/shop`} className="text-link">{navigationT('shop')} ↗</Link>
          </div>
          <div className="home-featured-grid">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                locale={locale}
                product={product}
                newLabel={shopT('newBadge')}
                offerLabel={shopT('offerBadge')}
                soldOutLabel={shopT('soldOut')}
              />
            ))}
          </div>
        </section>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
