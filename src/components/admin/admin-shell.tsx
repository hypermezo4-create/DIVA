import Link from 'next/link';
import {SiteFooter} from '@/components/layout/site-footer';
import {SiteHeader} from '@/components/layout/site-header';
import type {AppLocale} from '@/i18n/routing';
import styles from './admin-shell.module.css';

type NavItem = {href: string; label: string};

export function AdminShell({
  locale,
  title,
  subtitle,
  nav,
  children
}: {
  locale: AppLocale;
  title: string;
  subtitle: string;
  nav: NavItem[];
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader locale={locale} />
      <main className={styles.shell}>
        <aside className={styles.sidebar}>
          <div className={styles.brandBlock}>
            <span>DIVA · OPS</span>
            <strong>{title}</strong>
            <p>{subtitle}</p>
          </div>
          <nav className={styles.nav} aria-label={title}>
            {nav.map((item) => (
              <Link href={item.href} key={item.href}>{item.label}</Link>
            ))}
          </nav>
          <Link className={styles.storeLink} href={`/${locale}/shop`}>↗ DIVA Store</Link>
        </aside>
        <section className={styles.workspace}>{children}</section>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
