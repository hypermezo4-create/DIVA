import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required');

const sql = postgres(databaseUrl, {max: 1, prepare: false});
const testUserId = `smoke-${Date.now()}`;
const testOrderNumber = `DIVA-SMOKE-${Date.now()}`;
const testConfirmationToken = `smoke${Date.now()}confirmationtoken`;
const testPaymentKey = `smoke-payment-${Date.now()}`;
const testContentKey = `__smoke__.${Date.now()}`;

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
  const [{count: shippingMethods}] = await sql`
    select count(*)::int as count from shipping_methods where active = true
  `;
  const [{count: shippingTranslations}] = await sql`
    select count(*)::int as count from shipping_method_translations where method_code = 'standard'
  `;

  assert(activeProducts >= 6, `Expected at least 6 active products, found ${activeProducts}`);
  assert(translations >= activeProducts * 4, 'Every active seeded product must have four locale translations.');
  assert(sellableVariants > 0, 'Expected at least one sellable in-stock variant.');
  assert(offerVariants > 0, 'Expected seeded offer variants with a valid compare-at price.');
  assert(shippingMethods > 0, 'Expected at least one active shipping method.');
  assert(shippingTranslations >= 4, 'Expected shipping copy for all four locales.');

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

  const [smokeUser] = await sql`
    insert into "user" (id, name, email)
    values (${testUserId}, 'Smoke Customer', ${`${testUserId}@example.invalid`})
    returning role
  `;
  assert(smokeUser?.role === 'customer', 'New accounts must default to the customer role.');
  await sql`update "user" set role = 'admin' where id = ${testUserId}`;
  const [adminUser] = await sql`select role from "user" where id = ${testUserId}`;
  assert(adminUser?.role === 'admin', 'Admin role persistence smoke check failed.');

  await sql`
    insert into site_content (key, locale, value, updated_by)
    values (${testContentKey}, 'en', 'Smoke editorial override', ${testUserId})
  `;
  const [contentOverride] = await sql`
    select value from site_content where key = ${testContentKey} and locale = 'en'
  `;
  assert(contentOverride?.value === 'Smoke editorial override', 'Editable content persistence smoke check failed.');

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
  const [payment] = await sql`
    insert into payment_attempts (order_id, provider, idempotency_key, amount_minor, currency)
    values (${order.id}, 'smoke', ${testPaymentKey}, ${variant.price_minor}, ${variant.currency})
    returning id
  `;
  await sql`update payment_attempts set status = 'cancelled' where id = ${payment.id}`;
  await sql`update orders set status = 'cancelled', payment_status = 'cancelled' where id = ${order.id}`;

  const [{count: cartCount}] = await sql`select count(*)::int as count from cart_items where cart_id = ${cart.id}`;
  const [{count: wishlistCount}] = await sql`select count(*)::int as count from wishlists where user_id = ${testUserId}`;
  const [{count: orderCount}] = await sql`
    select count(*)::int as count from orders
    where number = ${testOrderNumber}
      and confirmation_token = ${testConfirmationToken}
      and status = 'cancelled'
      and payment_status = 'cancelled'
  `;
  const [{count: orderItemCount}] = await sql`select count(*)::int as count from order_items where order_id = ${order.id}`;
  const [{count: paymentCount}] = await sql`
    select count(*)::int as count from payment_attempts
    where order_id = ${order.id} and idempotency_key = ${testPaymentKey} and status = 'cancelled'
  `;
  assert(cartCount === 1, 'Cart persistence smoke check failed.');
  assert(wishlistCount === 1, 'Wishlist persistence smoke check failed.');
  assert(orderCount === 1 && orderItemCount === 1, 'Order persistence smoke check failed.');
  assert(paymentCount === 1, 'Payment attempt persistence smoke check failed.');

  console.log(`Commerce smoke passed: ${activeProducts} products, ${sellableVariants} sellable variants, ${offerVariants} offer variants, ${shippingMethods} shipping methods, admin/content persistence verified.`);
} finally {
  await sql`delete from site_content where key = ${testContentKey}`.catch(() => undefined);
  await sql`delete from orders where number = ${testOrderNumber}`.catch(() => undefined);
  await sql`delete from "user" where id = ${testUserId}`.catch(() => undefined);
  await sql.end();
}
