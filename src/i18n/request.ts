import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
import {isAppLocale} from './routing';

type MessageTree = {[key: string]: string | MessageTree};

function asTree(value: string | MessageTree | undefined): MessageTree {
  return typeof value === 'object' && value !== null ? value : {};
}

export default getRequestConfig(async ({requestLocale}) => {
  const requestedLocale = await requestLocale;

  if (!isAppLocale(requestedLocale)) {
    notFound();
  }

  const [baseModule, adminModule] = await Promise.all([
    import(`../../messages/${requestedLocale}.json`),
    import(`../../messages/admin/${requestedLocale}.json`)
  ]);
  const base = baseModule.default as MessageTree;
  const extra = adminModule.default as MessageTree;
  const baseAdmin = asTree(base.Admin);
  const extraAdmin = asTree(extra.Admin);
  const baseNav = asTree(baseAdmin.nav);
  const extraNav = asTree(extraAdmin.nav);

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
