import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required');

const sql = postgres(databaseUrl, {max: 1, prepare: false});
const testUserId = `smoke-${Date.now()}`;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

try {
  const [{count: activeProducts}] = await sql`select count(*)::int as count from products where status = 'active'`;
  const [{count: translations}] = await sql`select count(*)::int as count from product_translations`;
  const [{count: sellableVariants}] = await sql`
    select count(*)::int as count
    from product_variants pv
    join products p on p.id = pv.product_id
    join inventory i on i.variant_id = pv.id
    where p.status = 'active'
      and pv.active = true
      and pv.price_minor is not null
      and pv.currency is not null
      and i.on_hand - i.reserved > 0
  `;

  assert(activeProducts >= 6, `Expected at least 6 active products, found ${activeProducts}`);
  assert(translations >= activeProducts * 4, 'Every active seeded product must have four locale translations.');
  assert(sellableVariants > 0, 'Expected at least one sellable in-stock variant.');

  const [product] = await sql`select id from products where status = 'active' order by slug limit 1`;
  const [variant] = await sql`
    select pv.id
    from product_variants pv
    join inventory i on i.variant_id = pv.id
    where pv.active = true and pv.price_minor is not null and pv.currency is not null and i.on_hand - i.reserved > 0
    order by pv.sku
    limit 1
  `;
  assert(product?.id && variant?.id, 'Smoke fixture product and variant are required.');

  await sql`insert into "user" (id, name, email) values (${testUserId}, 'Smoke Customer', ${`${testUserId}@example.invalid`})`;
  const [cart] = await sql`insert into carts (user_id) values (${testUserId}) returning id`;
  await sql`insert into cart_items (cart_id, variant_id, quantity) values (${cart.id}, ${variant.id}, 1)`;
  await sql`insert into wishlists (user_id, product_id) values (${testUserId}, ${product.id})`;

  const [{count: cartCount}] = await sql`select count(*)::int as count from cart_items where cart_id = ${cart.id}`;
  const [{count: wishlistCount}] = await sql`select count(*)::int as count from wishlists where user_id = ${testUserId}`;
  assert(cartCount === 1, 'Cart persistence smoke check failed.');
  assert(wishlistCount === 1, 'Wishlist persistence smoke check failed.');

  console.log(`Commerce smoke passed: ${activeProducts} products, ${sellableVariants} sellable variants.`);
} finally {
  await sql`delete from "user" where id = ${testUserId}`.catch(() => undefined);
  await sql.end();
}
