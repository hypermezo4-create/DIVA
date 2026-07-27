import type {AppLocale} from '@/i18n/routing';

export const systemCopy: Record<AppLocale, {
  notFoundTitle: string;
  notFoundText: string;
  errorTitle: string;
  errorText: string;
  home: string;
  shop: string;
  retry: string;
}> = {
  en: {
    notFoundTitle: 'This page stepped away.',
    notFoundText: 'The page may have moved or the address may be incomplete. Return to DIVA or continue through the footwear edit.',
    errorTitle: 'Something interrupted this step.',
    errorText: 'Your session is still here. Try the page again, or return to the DIVA storefront.',
    home: 'DIVA home',
    shop: 'Explore footwear',
    retry: 'Try again'
  },
  ar: {
    notFoundTitle: 'هذه الصفحة لم تعد هنا.',
    notFoundText: 'قد تكون الصفحة انتقلت أو أن الرابط غير مكتمل. ارجع إلى ديفا أو تابع استكشاف الأحذية.',
    errorTitle: 'حدث عطل أثناء هذه الخطوة.',
    errorText: 'جلستك ما زالت محفوظة. حاول فتح الصفحة مرة أخرى أو ارجع إلى متجر ديفا.',
    home: 'الرئيسية',
    shop: 'استكشف الأحذية',
    retry: 'حاول مرة أخرى'
  },
  de: {
    notFoundTitle: 'Diese Seite ist nicht mehr hier.',
    notFoundText: 'Die Seite wurde möglicherweise verschoben oder die Adresse ist unvollständig. Zurück zu DIVA oder weiter zur Schuhauswahl.',
    errorTitle: 'Dieser Schritt wurde unterbrochen.',
    errorText: 'Deine Sitzung bleibt erhalten. Versuche die Seite erneut oder kehre zum DIVA Store zurück.',
    home: 'DIVA Startseite',
    shop: 'Schuhe entdecken',
    retry: 'Erneut versuchen'
  },
  ru: {
    notFoundTitle: 'Эта страница больше не здесь.',
    notFoundText: 'Возможно, страница перемещена или адрес указан не полностью. Вернитесь в DIVA или продолжите выбор обуви.',
    errorTitle: 'Этот шаг был прерван.',
    errorText: 'Ваша сессия сохранена. Попробуйте открыть страницу снова или вернитесь в магазин DIVA.',
    home: 'Главная DIVA',
    shop: 'Открыть обувь',
    retry: 'Попробовать снова'
  }
};
