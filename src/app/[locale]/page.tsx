import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {Hero} from '@/components/home/hero';
import {SignatureGrid} from '@/components/home/signature-grid';
import {ValueStrip} from '@/components/home/value-strip';
import {SiteFooter} from '@/components/layout/site-footer';
import {SiteHeader} from '@/components/layout/site-header';
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
  const [t, navigationT] = await Promise.all([
    getTranslations({locale, namespace: 'Home'}),
    getTranslations({locale, namespace: 'Navigation'})
  ]);

  const signatureItems = ['women', 'men', 'kids'].map((key) => ({
    slug: key,
    title: t(`categories.${key}.title`),
    label: t(`categories.${key}.label`)
  }));
  signatureItems.push({
    slug: 'offers',
    title: navigationT('offers'),
    label: navigationT('offers')
  });

  const values = ['craft', 'comfort', 'service'].map((key) => ({
    title: t(`values.${key}.title`),
    text: t(`values.${key}.text`)
  }));

  return (
    <>
      <SiteHeader locale={locale} />
      <main>
        <Hero
          locale={locale}
          copy={{
            kicker: t('hero.kicker'),
            title: t('hero.title'),
            description: t('hero.description'),
            primary: t('hero.primary'),
            secondary: t('hero.secondary'),
            edition: t('hero.edition')
          }}
        />
        <ValueStrip label={t('valuesLabel')} items={values} />
        <SignatureGrid locale={locale} title={t('signatureTitle')} items={signatureItems} />
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
