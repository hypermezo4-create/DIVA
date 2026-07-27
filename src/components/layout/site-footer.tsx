import Link from 'next/link';
import {getTranslations} from 'next-intl/server';
import {BrandMark} from '@/components/brand/brand-mark';
import {getStorefrontContent} from '@/features/content/repository';
import type {AppLocale} from '@/i18n/routing';

export async function SiteFooter({locale}: {locale: AppLocale}) {
  const [footerT, navigationT, overrides] = await Promise.all([
    getTranslations({locale, namespace: 'Footer'}),
    getTranslations({locale, namespace: 'Navigation'}),
    getStorefrontContent(locale)
  ]);

  const categories = ['women', 'men', 'kids', 'offers'] as const;
  const customNote = overrides.get('footer.note');

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__statement">
          <BrandMark />
          <p className="eyebrow">DIVA · Premium Mirror</p>
          <h2>{overrides.get('footer.title') ?? footerT('title')}</h2>
          {customNote && <p>{customNote}</p>}
        </div>

        <nav className="site-footer__nav" aria-label={navigationT('label')}>
          {categories.map((category) => (
            <Link href={`/${locale}/shop?category=${category}`} key={category}>
              {navigationT(category)}
            </Link>
          ))}
        </nav>

        <div className="site-footer__meta">
          <span>© {new Date().getFullYear()} DIVA</span>
          <Link href={`/${locale}/shop`}>{navigationT('shop')} ↗</Link>
        </div>
      </div>
    </footer>
  );
}
