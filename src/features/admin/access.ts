import 'server-only';

import {getSessionFromHeaders} from '@/lib/session';

export async function getAdminSession(headers: Headers) {
  const session = await getSessionFromHeaders(headers);
  if (!session || session.user.role !== 'admin') return null;
  return session;
}
