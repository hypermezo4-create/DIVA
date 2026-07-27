import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required');

const sql = postgres(databaseUrl, {max: 1, prepare: false});
const testUserId = `smoke-${Date.now()}`;
const testOrderNumber = `DIVA-SMOKE-${Date.now()}`;
const testConfirmationToken = `smoke${Date.now()}confirmationtoken`;

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
  const [{count: offerVariants}] = await sql`
    select count(*)::int as count
    from product_variants pv
    join products p on p.id = pv.product_id
    where p.status = 'active'
      and pv.active = true
      and pv.price_minor is not null
      and pv.compare_at_minor is not null
      and pv.compare_at_minor > pv.price_minor
  `;

  assert(activeProducts >= 6, `Expected at least 6 active products, found ${activeProducts}`);
  assert(translations >= activeProducts * 4, 'Every active seeded product must have four locale translations.');
  assert(sellableVariants > 0, 'Expected at least one sellable in-stock variant.');
  assert(offerVariants > 0, 'Expected seeded offer variants with a valid compare-at price.');

  const [product] = await sql`select id from products where status = 'active' order by slug limit 1`;
  const [variant] = await sql`
    select pv.id, pv.sku, pv.price_minor, pv.currency
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

  const [order] = await sql`
    insert into orders (
      number, confirmation_token, user_id, customer_name, email, phone, address_line_1, city, country_code,
      shipping_method, currency, subtotal_minor, shipping_minor, total_minor
    ) values (
      ${testOrderNumber}, ${testConfirmationToken}, ${testUserId}, 'Smoke Customer', ${`${testUserId}@example.invalid`}, '+10000000000',
      'Smoke Street 1', 'Smoke City', 'US', 'standard', ${variant.currency}, ${variant.price_minor}, 0, ${variant.price_minor}
    ) returning id
  `;
  await sql`
    insert into order_items (
      order_id, variant_id, sku, product_name, size_label, color_label, unit_price_minor, quantity, line_total_minor
    ) values (
      ${order.id}, ${variant.id}, ${variant.sku}, 'Smoke Product', '42', 'Smoke', ${variant.price_minor}, 1, ${variant.price_minor}
    )
  `;

  const [{count: cartCount}] = await sql`select count(*)::int as count from cart_items where cart_id = ${cart.id}`;
  const [{count: wishlistCount}] = await sql`select count(*)::int as count from wishlists where user_id = ${testUserId}`;
  const [{count: orderCount}] = await sql`select count(*)::int as count from orders where number = ${testOrderNumber} and confirmation_token = ${testConfirmationToken}`;
  const [{count: orderItemCount}] = await sql`select count(*)::int as count from order_items where order_id = ${order.id}`;
  assert(cartCount === 1, 'Cart persistence smoke check failed.');
  assert(wishlistCount === 1, 'Wishlist persistence smoke check failed.');
  assert(orderCount === 1 && orderItemCount === 1, 'Order persistence smoke check failed.');

  console.log(`Commerce smoke passed: ${activeProducts} products, ${sellableVariants} sellable variants, ${offerVariants} offer variants.`);
} finally {
  await sql`delete from orders where number = ${testOrderNumber}`.catch(() => undefined);
  await sql`delete from "user" where id = ${testUserId}`.catch(() => undefined);
  await sql.end();
}
