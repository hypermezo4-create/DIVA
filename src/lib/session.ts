import 'server-only';

import {getAuth} from '@/lib/auth';

export async function getSessionFromHeaders(headers: Headers) {
  return getAuth().api.getSession({headers});
}
