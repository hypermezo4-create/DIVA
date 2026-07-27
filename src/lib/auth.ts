import 'server-only';

import {betterAuth} from 'better-auth';
import {drizzleAdapter} from 'better-auth/adapters/drizzle';
import {getDatabase} from '@/db/client';
import {account, session, user, verification} from '@/db/schema';
import {getServerEnv} from '@/lib/server-env';

const authSchema = {user, session, account, verification};

const customerFields = {
  role: {
    type: ['customer', 'admin'] as const,
    required: false,
    defaultValue: 'customer',
    input: false
  },
  locale: {
    type: 'string' as const,
    required: false,
    defaultValue: 'en',
    input: false
  }
};

function createAuth() {
  const env = getServerEnv();
  const database = drizzleAdapter(getDatabase(), {provider: 'pg', schema: authSchema});

  return betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    database,
    emailAndPassword: {enabled: true},
    user: {additionalFields: customerFields}
  });
}

let authInstance: ReturnType<typeof createAuth> | undefined;

export function getAuth() {
  authInstance ??= createAuth();
  return authInstance;
}
