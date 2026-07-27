import {getTranslations} from 'next-intl/server';
import type {AppLocale} from '@/i18n/routing';

export async function SiteFooter({locale}: {locale: AppLocale}) {
  const t = await getTranslations({locale, namespace: 'Footer'});

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div>
          <p className="eyebrow">DIVA · Premium Mirror</p>
          <h2>{t('title')}</h2>
        </div>
        <p>{t('note')}</p>
        <span>© {new Date().getFullYear()} DIVA</span>
      </div>
    </footer>
  );
}
