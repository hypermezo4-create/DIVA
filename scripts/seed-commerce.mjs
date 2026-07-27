import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required');

const sql = postgres(databaseUrl, {max: 1, prepare: false});

const methods = [
  {
    code: 'standard',
    priceMinor: 0,
    currency: 'USD',
    sortOrder: 0,
    labels: {
      en: ['Standard delivery', 'Current default delivery method. Production rates can be changed without changing checkout code.'],
      ar: ['توصيل عادي', 'طريقة التوصيل الافتراضية الحالية ويمكن تعديل سعرها للإنتاج بدون تغيير كود الدفع.'],
      de: ['Standardversand', 'Aktuelle Standard-Versandart. Produktionspreise können ohne Checkout-Codeänderung angepasst werden.'],
      ru: ['Стандартная доставка', 'Текущий стандартный способ доставки. Тариф можно изменить без изменения checkout-кода.']
    }
  }
];

for (const method of methods) {
  await sql`
    insert into shipping_methods (code, active, price_minor, currency, sort_order)
    values (${method.code}, true, ${method.priceMinor}, ${method.currency}, ${method.sortOrder})
    on conflict (code) do update set
      active = excluded.active,
      price_minor = excluded.price_minor,
      currency = excluded.currency,
      sort_order = excluded.sort_order,
      updated_at = now()
  `;

  for (const [locale, [name, description]] of Object.entries(method.labels)) {
    await sql`
      insert into shipping_method_translations (method_code, locale, name, description)
      values (${method.code}, ${locale}::locale_code, ${name}, ${description})
      on conflict (method_code, locale) do update set
        name = excluded.name,
        description = excluded.description
    `;
  }
}

await sql.end();
console.log(`Seeded ${methods.length} shipping method.`);
