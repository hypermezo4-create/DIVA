import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required');

const [emailArg, roleArg] = process.argv.slice(2);
const email = emailArg?.trim().toLowerCase();
const role = roleArg?.trim().toLowerCase();

if (!email || !email.includes('@')) {
  throw new Error('Usage: npm run admin:role -- <email> <admin|customer>');
}
if (role !== 'admin' && role !== 'customer') {
  throw new Error('Role must be either admin or customer.');
}

const sql = postgres(databaseUrl, {max: 1, prepare: false});
try {
  const [updated] = await sql`
    update "user"
    set role = ${role}, updated_at = now()
    where lower(email) = ${email}
    returning id, email, role
  `;
  if (!updated) throw new Error(`No user found for ${email}`);
  console.log(`Updated ${updated.email} to role: ${updated.role}`);
} finally {
  await sql.end();
}
