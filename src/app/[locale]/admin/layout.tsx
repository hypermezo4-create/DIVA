import {headers} from 'next/headers';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound, redirect} from 'next/navigation';
import {AdminShell} from '@/components/admin/admin-shell';
import {getSessionFromHeaders} from '@/lib/session';
import {isAppLocale} from '@/i18n/routing';

export default async function AdminLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}>) {
  const {locale} = await params;
  if (!isAppLocale(locale)) notFound();
  setRequestLocale(locale);

  const session = await getSessionFromHeaders(await headers());
  if (!session) redirect(`/${locale}/account`);
  if (session.user.role !== 'admin') notFound();

  const t = await getTranslations({locale, namespace: 'Admin'});
  const nav = [
    ['dashboard', `/${locale}/admin`],
    ['products', `/${locale}/admin/products`],
    ['inventory', `/${locale}/admin/inventory`],
    ['orders', `/${locale}/admin/orders`],
    ['customers', `/${locale}/admin/customers`],
    ['content', `/${locale}/admin/content`]
  ].map(([key, href]) => ({label: t(`nav.${key}`), href}));

  return (
    <AdminShell
      locale={locale}
      title={t('shellTitle')}
      subtitle={t('shellSubtitle')}
      nav={nav}
    >
      {children}
    </AdminShell>
  );
}
