import {getTranslations} from 'next-intl/server';
import {getStorefrontContent} from '@/features/content/repository';
import type {AppLocale} from '@/i18n/routing';

export async function SiteFooter({locale}: {locale: AppLocale}) {
  const [t, overrides] = await Promise.all([
    getTranslations({locale, namespace: 'Footer'}),
    getStorefrontContent(locale)
  ]);

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div>
          <p className="eyebrow">DIVA · Premium Mirror</p>
          <h2>{overrides.get('footer.title') ?? t('title')}</h2>
        </div>
        <p>{overrides.get('footer.note') ?? t('note')}</p>
        <span>© {new Date().getFullYear()} DIVA</span>
      </div>
    </footer>
  );
}
