import Link from 'next/link';
import {getTranslations} from 'next-intl/server';
import {BrandMark} from '@/components/brand/brand-mark';
import {CommerceHeaderActions} from '@/components/layout/commerce-header-actions';
import {LocaleSwitcher} from '@/components/ui/locale-switcher';
import {ThemeToggle} from '@/components/ui/theme-toggle';
import type {AppLocale} from '@/i18n/routing';
import styles from './site-header.module.css';

function AccountIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5.5 19c.7-3.3 3.1-5.2 6.5-5.2s5.8 1.9 6.5 5.2" />
    </svg>
  );
}

export async function SiteHeader({locale}: {locale: AppLocale}) {
  const t = await getTranslations({locale, namespace: 'Navigation'});
  const links = [
    ['women', t('women')],
    ['men', t('men')],
    ['kids', t('kids')],
    ['offers', t('offers')]
  ] as const;

  return (
    <header className={`site-header ${styles.header}`}>
      <div className="site-header__inner">
        <Link href={`/${locale}`} className="brand-link" aria-label={`DIVA · ${t('home')}`}>
          <BrandMark />
        </Link>
        <nav className="desktop-nav" aria-label={t('label')}>
          {links.map(([slug, label]) => (
            <Link href={`/${locale}/shop?category=${slug}`} key={slug}>{label}</Link>
          ))}
        </nav>
        <div className="header-actions">
          <LocaleSwitcher locale={locale} label={t('language')} />
          <ThemeToggle label={t('theme')} />
          <Link href={`/${locale}/account`} className={styles.accountLink} aria-label={t('account')}>
            <AccountIcon />
            <span>{t('account')}</span>
          </Link>
          <CommerceHeaderActions locale={locale} wishlistLabel={t('wishlist')} cartLabel={t('cart')} />
          <Link href={`/${locale}/shop`} className="header-shop-link">{t('shop')}</Link>
        </div>
      </div>
    </header>
  );
}
