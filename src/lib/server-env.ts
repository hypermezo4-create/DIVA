import 'server-only';

import {z} from 'zod';

const databaseEnvSchema = z.object({
  DATABASE_URL: z.string().min(1)
});

const authEnvSchema = z.object({
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url().optional()
});

export type DatabaseEnv = z.infer<typeof databaseEnvSchema>;
export type AuthEnv = z.infer<typeof authEnvSchema>;

export function getDatabaseEnv(): DatabaseEnv {
  return databaseEnvSchema.parse({DATABASE_URL: process.env.DATABASE_URL});
}

export function getAuthEnv(): AuthEnv {
  return authEnvSchema.parse({
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL
  });
}
