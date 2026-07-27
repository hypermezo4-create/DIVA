import type {Metadata} from 'next';
import {headers} from 'next/headers';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {AccountPanel} from '@/components/account/account-panel';
import {SiteFooter} from '@/components/layout/site-footer';
import {SiteHeader} from '@/components/layout/site-header';
import {isAppLocale} from '@/i18n/routing';
import {getSessionFromHeaders} from '@/lib/session';
import styles from './account.module.css';

type AccountPageProps = {params: Promise<{locale: string}>};

export async function generateMetadata({params}: AccountPageProps): Promise<Metadata> {
  const {locale} = await params;
  if (!isAppLocale(locale)) return {};

  const t = await getTranslations({locale, namespace: 'Account'});
  return {title: t('metaTitle'), description: t('intro')};
}

export default async function AccountPage({params}: AccountPageProps) {
  const {locale} = await params;
  if (!isAppLocale(locale)) notFound();

  setRequestLocale(locale);
  const [t, session] = await Promise.all([
    getTranslations({locale, namespace: 'Account'}),
    getSessionFromHeaders(await headers())
  ]);

  return (
    <>
      <SiteHeader locale={locale} />
      <main className={styles.page}>
        <header className={styles.intro}>
          <p className="eyebrow">DIVA · PRIVATE CLIENT</p>
          <h1>{t('title')}</h1>
          <p>{t('intro')}</p>
        </header>
        <AccountPanel
          locale={locale}
          isAdmin={session?.user.role === 'admin'}
          copy={{
            signIn: t('signIn'),
            signUp: t('signUp'),
            name: t('name'),
            email: t('email'),
            password: t('password'),
            loginAction: t('loginAction'),
            registerAction: t('registerAction'),
            switchToRegister: t('switchToRegister'),
            switchToLogin: t('switchToLogin'),
            signedInAs: t('signedInAs'),
            myOrders: t('myOrders'),
            admin: t('admin'),
            signOut: t('signOut'),
            working: t('working'),
            genericError: t('genericError')
          }}
        />
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
