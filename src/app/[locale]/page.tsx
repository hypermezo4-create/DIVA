import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {Hero} from '@/components/home/hero';
import {SignatureGrid} from '@/components/home/signature-grid';
import {ValueStrip} from '@/components/home/value-strip';
import {SiteFooter} from '@/components/layout/site-footer';
import {SiteHeader} from '@/components/layout/site-header';
import type {StorefrontContentKey} from '@/features/content/definitions';
import {getStorefrontContent} from '@/features/content/repository';
import {isAppLocale} from '@/i18n/routing';

type PageProps = {params: Promise<{locale: string}>};

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
  const {locale} = await params;
  if (!isAppLocale(locale)) return {};

  const t = await getTranslations({locale, namespace: 'Metadata'});
  return {title: t('title'), description: t('description')};
}

export default async function HomePage({params}: PageProps) {
  const {locale} = await params;

  if (!isAppLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const [t, navigationT, overrides] = await Promise.all([
    getTranslations({locale, namespace: 'Home'}),
    getTranslations({locale, namespace: 'Navigation'}),
    getStorefrontContent(locale)
  ]);
  const content = (key: StorefrontContentKey, fallback: string) => overrides.get(key) ?? fallback;

  const signatureItems = ['women', 'men', 'kids'].map((key) => ({
    slug: key,
    title: content(`home.categories.${key}.title` as StorefrontContentKey, t(`categories.${key}.title`)),
    label: t(`categories.${key}.label`)
  }));
  signatureItems.push({
    slug: 'offers',
    title: navigationT('offers'),
    label: navigationT('offers')
  });

  const values = ['craft', 'comfort', 'service'].map((key) => ({
    title: content(`home.values.${key}.title` as StorefrontContentKey, t(`values.${key}.title`)),
    text: content(`home.values.${key}.text` as StorefrontContentKey, t(`values.${key}.text`))
  }));

  return (
    <>
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
        />
        <ValueStrip label={t('valuesLabel')} items={values} />
        <SignatureGrid
          locale={locale}
          title={content('home.signatureTitle', t('signatureTitle'))}
          items={signatureItems}
        />
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
