import {createHash} from 'node:crypto';
import {readdir, readFile} from 'node:fs/promises';
import {join} from 'node:path';
import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required');

const sql = postgres(databaseUrl, {max: 1, prepare: false});
const migrationDir = join(process.cwd(), 'drizzle');
const files = (await readdir(migrationDir)).filter((file) => file.endsWith('.sql')).sort();

await sql`
  create table if not exists diva_migrations (
    name text primary key,
    checksum text not null,
    applied_at timestamp with time zone default now() not null
  )
`;

for (const name of files) {
  const body = await readFile(join(migrationDir, name), 'utf8');
  const checksum = createHash('sha256').update(body).digest('hex');
  const [existing] = await sql`select checksum from diva_migrations where name = ${name}`;

  if (existing) {
    if (existing.checksum !== checksum) throw new Error(`Applied migration changed: ${name}`);
    continue;
  }

  await sql.begin(async (tx) => {
    await tx.unsafe(body);
    await tx`insert into diva_migrations (name, checksum) values (${name}, ${checksum})`;
  });
  console.log(`Applied ${name}`);
}

await sql.end();
console.log('Database migrations are up to date.');
