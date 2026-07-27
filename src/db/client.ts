import 'server-only';

import {drizzle} from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import {getDatabaseEnv} from '@/lib/server-env';
import * as schema from './schema';

function createDatabase() {
  const client = postgres(getDatabaseEnv().DATABASE_URL, {
    max: 10,
    prepare: false
  });

  return drizzle(client, {schema});
}

let database: ReturnType<typeof createDatabase> | undefined;

export function getDatabase() {
  database ??= createDatabase();
  return database;
}
