import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
import {isAppLocale} from './routing';

type MessageRecord = Record<string, unknown>;

export default getRequestConfig(async ({requestLocale}) => {
  const requestedLocale = await requestLocale;

  if (!isAppLocale(requestedLocale)) {
    notFound();
  }

  const [baseModule, adminModule] = await Promise.all([
    import(`../../messages/${requestedLocale}.json`),
    import(`../../messages/admin/${requestedLocale}.json`)
  ]);
  const base = baseModule.default as MessageRecord;
  const extra = adminModule.default as MessageRecord;
  const baseAdmin = (base.Admin ?? {}) as MessageRecord;
  const extraAdmin = (extra.Admin ?? {}) as MessageRecord;
  const baseNav = (baseAdmin.nav ?? {}) as MessageRecord;
  const extraNav = (extraAdmin.nav ?? {}) as MessageRecord;

  return {
    locale: requestedLocale,
    messages: {
      ...base,
      Admin: {
        ...baseAdmin,
        ...extraAdmin,
        nav: {...baseNav, ...extraNav}
      }
    }
  };
});
