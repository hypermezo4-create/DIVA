import 'server-only';

import {betterAuth} from 'better-auth';
import {drizzleAdapter} from 'better-auth/adapters/drizzle';
import {getDatabase} from '@/db/client';
import {account, session, user, verification} from '@/db/schema';
import {getServerEnv} from '@/lib/server-env';

function createAuth() {
  const env = getServerEnv();

  return betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    database: drizzleAdapter(getDatabase(), {
      provider: 'pg',
      schema: {user, session, account, verification}
    }),
    emailAndPassword: {
      enabled: true
    },
    user: {
      additionalFields: {
        role: {
          type: ['customer', 'admin'],
          required: false,
          defaultValue: 'customer',
          input: false
        },
        locale: {
          type: 'string',
          required: false,
          defaultValue: 'en'
        }
      }
    }
  });
}

let authInstance: ReturnType<typeof createAuth> | undefined;

export function getAuth() {
  authInstance ??= createAuth();
  return authInstance;
}
