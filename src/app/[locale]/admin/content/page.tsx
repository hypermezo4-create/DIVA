import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {ContentEditor} from '@/components/admin/content-editor';
import {storefrontContentDefinitions} from '@/features/content/definitions';
import {listStorefrontContentOverrides} from '@/features/content/repository';
import {isAppLocale, locales, type AppLocale} from '@/i18n/routing';
import styles from '@/components/admin/admin-shell.module.css';
import arMessages from '../../../../../messages/ar.json';
import deMessages from '../../../../../messages/de.json';
import enMessages from '../../../../../messages/en.json';
import ruMessages from '../../../../../messages/ru.json';

type PageProps = {params: Promise<{locale: string}>};

const baseMessages: Record<AppLocale, unknown> = {
  ar: arMessages,
  en: enMessages,
  de: deMessages,
  ru: ruMessages
};

const localeLabels: Record<AppLocale, string> = {
  ar: 'العربية',
  en: 'English',
  de: 'Deutsch',
  ru: 'Русский'
};

function readMessage(messages: unknown, namespace: string, path: string) {
  let value: unknown = messages;
  for (const segment of [namespace, ...path.split('.')]) {
    if (!value || typeof value !== 'object') return '';
    value = (value as Record<string, unknown>)[segment];
  }
  return typeof value === 'string' ? value : '';
}

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
  const {locale} = await params;
  if (!isAppLocale(locale)) return {};
  const t = await getTranslations({locale, namespace: 'Admin'});
  return {title: t('content.metaTitle'), robots: {index: false, follow: false}};
}

export default async function AdminContentPage({params}: PageProps) {
  const {locale} = await params;
  if (!isAppLocale(locale)) notFound();
  setRequestLocale(locale);

  const [t, overrides] = await Promise.all([
    getTranslations({locale, namespace: 'Admin'}),
    listStorefrontContentOverrides()
  ]);

  const overrideMap = new Map(overrides.map((row) => [`${row.key}:${row.locale}`, row.value]));
  const entries = storefrontContentDefinitions.map((definition) => {
    const values = {} as Record<AppLocale, string>;
    const defaults = {} as Record<AppLocale, string>;
    const overridden = {} as Record<AppLocale, boolean>;
    for (const contentLocale of locales) {
      const overrideKey = `${definition.key}:${contentLocale}`;
      const override = overrideMap.get(overrideKey);
      const fallback = readMessage(baseMessages[contentLocale], definition.namespace, definition.messageKey);
      defaults[contentLocale] = fallback;
      values[contentLocale] = override ?? fallback;
      overridden[contentLocale] = override !== undefined;
    }
    return {key: definition.key, values, defaults, overridden};
  });

  return (
    <>
      <header className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>DIVA · EDITORIAL DESK</span>
          <h1>{t('content.title')}</h1>
        </div>
        <p>{t('content.intro')}</p>
      </header>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>{t('content.storefront')}</h2>
            <p>{t('content.storefrontNote', {count: entries.length})}</p>
          </div>
        </div>
      </section>

      <ContentEditor
        entries={entries}
        localeLabels={localeLabels}
        labels={{
          save: t('common.save'),
          reset: t('content.reset'),
          saving: t('common.saving'),
          saved: t('common.saved'),
          error: t('common.error'),
          inherited: t('content.inherited'),
          override: t('content.override')
        }}
      />
    </>
  );
}
