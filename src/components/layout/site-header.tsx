import Link from 'next/link';
import {getTranslations} from 'next-intl/server';
import {BrandMark} from '@/components/brand/brand-mark';
import {LocaleSwitcher} from '@/components/ui/locale-switcher';
import {ThemeToggle} from '@/components/ui/theme-toggle';
import type {AppLocale} from '@/i18n/routing';

export async function SiteHeader({locale}: {locale: AppLocale}) {
  const t = await getTranslations({locale, namespace: 'Navigation'});
  const links = [
    ['new', t('new')],
    ['women', t('women')],
    ['men', t('men')],
    ['kids', t('kids')],
    ['collections', t('collections')]
  ] as const;

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href={`/${locale}`} className="brand-link" aria-label={`DIVA · ${t('home')}`}>
          <BrandMark />
        </Link>

        <nav className="desktop-nav" aria-label={t('label')}>
          {links.map(([slug, label]) => (
            <Link href={`/${locale}/shop?category=${slug}`} key={slug}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <LocaleSwitcher locale={locale} label={t('language')} />
          <ThemeToggle label={t('theme')} />
          <Link href={`/${locale}/shop`} className="header-shop-link">
            {t('shop')}
          </Link>
        </div>
      </div>
    </header>
  );
}
