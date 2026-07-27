import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
import {isAppLocale} from './routing';

export default getRequestConfig(async ({requestLocale}) => {
  const requestedLocale = await requestLocale;

  if (!isAppLocale(requestedLocale)) {
    notFound();
  }

  return {
    locale: requestedLocale,
    messages: (await import(`../../messages/${requestedLocale}.json`)).default
  };
});
