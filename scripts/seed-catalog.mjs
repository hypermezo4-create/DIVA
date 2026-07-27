import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required');

const sql = postgres(databaseUrl, {max: 1, prepare: false});

const colors = {
  espresso: {hex: '#3a2419', labels: {en: 'Espresso', ar: 'إسبريسو', de: 'Espresso', ru: 'Эспрессо'}},
  ivory: {hex: '#efe4d3', labels: {en: 'Ivory', ar: 'عاجي', de: 'Elfenbein', ru: 'Слоновая кость'}},
  black: {hex: '#161310', labels: {en: 'Black', ar: 'أسود', de: 'Schwarz', ru: 'Чёрный'}},
  gold: {hex: '#b98a43', labels: {en: 'Champagne Gold', ar: 'ذهبي شامبانيا', de: 'Champagnergold', ru: 'Золото шампань'}},
  burgundy: {hex: '#5b1f2b', labels: {en: 'Burgundy', ar: 'عنابي', de: 'Burgunder', ru: 'Бордовый'}}
};

const collections = [
  {slug: 'mirror', labels: {en: 'The Mirror Edition', ar: 'مجموعة المرآة', de: 'The Mirror Edition', ru: 'The Mirror Edition'}},
  {slug: 'city', labels: {en: 'The City Edit', ar: 'اختيارات المدينة', de: 'The City Edit', ru: 'The City Edit'}}
];

const products = [
  {
    slug: 'milano-court-01', sku: 'MILANO01', audience: 'men', family: 'sneaker', collection: 'city', newArrival: true,
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1400&q=88', 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?auto=format&fit=crop&w=1400&q=88'],
    sizes: ['40', '41', '42', '43', '44'], colors: ['ivory', 'espresso'], priceMinor: 18900, compareAtMinor: 22900,
    copy: {
      en: ['Milano Court 01', 'City sneaker', 'A clean court silhouette with a sculpted sole and understated detailing for polished everyday movement.'],
      ar: ['Milano Court 01', 'سنيكرز للمدينة', 'تصميم كورت نظيف بنعل منحوت وتفاصيل هادئة يمنح الإطلالة اليومية لمسة مصقولة.'],
      de: ['Milano Court 01', 'City-Sneaker', 'Eine klare Court-Silhouette mit skulpturaler Sohle und dezenten Details für einen eleganten Alltag.'],
      ru: ['Milano Court 01', 'Городские кеды', 'Лаконичный силуэт с выразительной подошвой и сдержанными деталями для современного повседневного образа.']
    }
  },
  {
    slug: 'aurelia-08', sku: 'AURELIA08', audience: 'women', family: 'heel', collection: 'mirror', newArrival: true,
    images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1400&q=88', 'https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?auto=format&fit=crop&w=1400&q=88'],
    sizes: ['36', '37', '38', '39', '40'], colors: ['gold', 'black'], priceMinor: 22900, compareAtMinor: null,
    copy: {
      en: ['Aurelia 08', 'Sculpted heel', 'A refined pointed profile balanced by a confident sculpted heel and a luminous evening finish.'],
      ar: ['Aurelia 08', 'كعب منحوت', 'مقدمة راقية بخط مدبب تتوازن مع كعب منحوت واثق ولمسة لامعة تناسب السهرات.'],
      de: ['Aurelia 08', 'Skulpturaler Absatz', 'Eine elegante spitze Form mit markantem Absatz und einem leuchtenden Finish für den Abend.'],
      ru: ['Aurelia 08', 'Скульптурный каблук', 'Утончённый острый силуэт, выразительный каблук и мягкое сияние для вечернего образа.']
    }
  },
  {
    slug: 'noir-loafer-03', sku: 'NOIR03', audience: 'men', family: 'loafer', collection: 'mirror', newArrival: false,
    images: ['https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=1400&q=88'],
    sizes: ['40', '41', '42', '43', '44'], colors: ['black', 'espresso'], priceMinor: 21500, compareAtMinor: null,
    copy: {
      en: ['Noir Loafer 03', 'Leather loafer', 'A streamlined loafer with a low profile, softened structure and a polished finish that moves between tailoring and denim.'],
      ar: ['Noir Loafer 03', 'لوفر جلد', 'لوفر بانسيابية هادئة وبناء مرن وتشطيب مصقول يناسب الإطلالات الرسمية والكاجوال.'],
      de: ['Noir Loafer 03', 'Leder-Loafer', 'Ein schlanker Loafer mit weicher Konstruktion und poliertem Finish für Anzug und Denim.'],
      ru: ['Noir Loafer 03', 'Кожаные лоферы', 'Лаконичные лоферы с мягкой конструкцией и полированной отделкой для костюма и денима.']
    }
  },
  {
    slug: 'celeste-line-02', sku: 'CELESTE02', audience: 'women', family: 'sandal', collection: 'city', newArrival: true,
    images: ['https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=1400&q=88'],
    sizes: ['36', '37', '38', '39', '40'], colors: ['ivory', 'gold'], priceMinor: 17900, compareAtMinor: 20900,
    copy: {
      en: ['Celeste Line 02', 'Minimal sandal', 'Slim straps, a balanced footbed and a restrained metallic accent create an effortless warm-weather signature.'],
      ar: ['Celeste Line 02', 'صندل مينيمال', 'سيور رفيعة وقاعدة متوازنة ولمسة معدنية هادئة تصنع توقيعًا أنيقًا للأيام الدافئة.'],
      de: ['Celeste Line 02', 'Minimalistische Sandale', 'Schmale Riemen, ein ausgewogenes Fußbett und ein dezenter Metallakzent für warme Tage.'],
      ru: ['Celeste Line 02', 'Минималистичные сандалии', 'Тонкие ремешки, выверенная колодка и деликатный металлический акцент для тёплого сезона.']
    }
  },
  {
    slug: 'junior-court-05', sku: 'JUNIOR05', audience: 'kids', family: 'sneaker', collection: 'city', newArrival: true,
    images: ['https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=1400&q=88'],
    sizes: ['28', '29', '30', '31', '32', '33', '34'], colors: ['ivory', 'burgundy'], priceMinor: 12900, compareAtMinor: null,
    copy: {
      en: ['Junior Court 05', 'Kids sneaker', 'A lightweight everyday sneaker with a supportive profile and clean details designed for busy little steps.'],
      ar: ['Junior Court 05', 'سنيكرز أطفال', 'سنيكرز يومي خفيف ببناء داعم وتفاصيل نظيفة يناسب الحركة المستمرة والخطوات الصغيرة.'],
      de: ['Junior Court 05', 'Kinder-Sneaker', 'Ein leichter Alltagssneaker mit stützender Form und klaren Details für aktive kleine Schritte.'],
      ru: ['Junior Court 05', 'Детские кеды', 'Лёгкая повседневная модель с поддерживающим силуэтом и чистыми деталями для активных детей.']
    }
  },
  {
    slug: 'mini-mirror-04', sku: 'MINI04', audience: 'kids', family: 'boot', collection: 'mirror', newArrival: false,
    images: ['https://images.unsplash.com/photo-1554139844-af2fc8ad3a3a?auto=format&fit=crop&w=1400&q=88'],
    sizes: ['29', '30', '31', '32', '33', '34'], colors: ['espresso', 'black'], priceMinor: 14900, compareAtMinor: 17900,
    copy: {
      en: ['Mini Mirror 04', 'Kids ankle boot', 'A compact ankle boot with a soft structure, stable sole and polished finish inspired by the DIVA Mirror line.'],
      ar: ['Mini Mirror 04', 'بوت أطفال قصير', 'بوت قصير ببناء مريح ونعل ثابت وتشطيب مصقول مستوحى من مجموعة DIVA Mirror.'],
      de: ['Mini Mirror 04', 'Kinder-Stiefelette', 'Eine kompakte Stiefelette mit weicher Struktur, stabiler Sohle und poliertem Finish aus der DIVA Mirror Linie.'],
      ru: ['Mini Mirror 04', 'Детские ботинки', 'Компактные ботинки с мягкой конструкцией, устойчивой подошвой и отделкой в духе линии DIVA Mirror.']
    }
  }
];

await sql.begin(async (tx) => {
  const collectionIds = new Map();
  for (const collection of collections) {
    const [row] = await tx`insert into collections (slug) values (${collection.slug}) on conflict (slug) do update set updated_at = now() returning id`;
    collectionIds.set(collection.slug, row.id);
    for (const [locale, name] of Object.entries(collection.labels)) {
      await tx`insert into collection_translations (collection_id, locale, name) values (${row.id}, ${locale}::locale_code, ${name}) on conflict (collection_id, locale) do update set name = excluded.name`;
    }
  }

  const colorIds = new Map();
  for (const [code, color] of Object.entries(colors)) {
    const [row] = await tx`insert into colors (code, hex) values (${code}, ${color.hex}) on conflict (code) do update set hex = excluded.hex returning id`;
    colorIds.set(code, row.id);
    for (const [locale, label] of Object.entries(color.labels)) {
      await tx`insert into color_translations (color_id, locale, label) values (${row.id}, ${locale}::locale_code, ${label}) on conflict (color_id, locale) do update set label = excluded.label`;
    }
  }

  const allSizes = [...new Set(products.flatMap((product) => product.sizes))].sort((a, b) => Number(a) - Number(b));
  const sizeIds = new Map();
  for (const [sortOrder, size] of allSizes.entries()) {
    const [row] = await tx`insert into sizes (code, label, sort_order) values (${size}, ${size}, ${sortOrder}) on conflict (code) do update set label = excluded.label, sort_order = excluded.sort_order returning id`;
    sizeIds.set(size, row.id);
  }

  for (const product of products) {
    const [row] = await tx`
      insert into products (slug, audience, family, status, new_arrival, collection_id)
      values (${product.slug}, ${product.audience}::catalog_audience, ${product.family}::product_family, 'active', ${product.newArrival}, ${collectionIds.get(product.collection)})
      on conflict (slug) do update set audience = excluded.audience, family = excluded.family, status = 'active', new_arrival = excluded.new_arrival, collection_id = excluded.collection_id, updated_at = now()
      returning id
    `;

    for (const [locale, [name, subtitle, description]] of Object.entries(product.copy)) {
      await tx`insert into product_translations (product_id, locale, name, subtitle, description) values (${row.id}, ${locale}::locale_code, ${name}, ${subtitle}, ${description}) on conflict (product_id, locale) do update set name = excluded.name, subtitle = excluded.subtitle, description = excluded.description`;
    }

    for (const [sortOrder, url] of product.images.entries()) {
      await tx`insert into product_images (product_id, url, alt_text, sort_order) values (${row.id}, ${url}, ${product.copy.en[0]}, ${sortOrder}) on conflict (product_id, sort_order) do update set url = excluded.url, alt_text = excluded.alt_text`;
    }

    for (const colorCode of product.colors) {
      for (const size of product.sizes) {
        const sku = `${product.sku}-${colorCode}-${size}`.toUpperCase();
        const [variant] = await tx`
          insert into product_variants (product_id, color_id, size_id, sku, price_minor, compare_at_minor, currency, active)
          values (${row.id}, ${colorIds.get(colorCode)}, ${sizeIds.get(size)}, ${sku}, ${product.priceMinor}, ${product.compareAtMinor}, 'USD', true)
          on conflict (sku) do update set product_id = excluded.product_id, color_id = excluded.color_id, size_id = excluded.size_id, price_minor = excluded.price_minor, compare_at_minor = excluded.compare_at_minor, currency = excluded.currency, active = true, updated_at = now()
          returning id
        `;
        const stock = 4 + ((Number(size) + colorCode.length) % 8);
        await tx`insert into inventory (variant_id, on_hand, reserved) values (${variant.id}, ${stock}, 0) on conflict (variant_id) do update set on_hand = excluded.on_hand, reserved = least(inventory.reserved, excluded.on_hand), updated_at = now()`;
      }
    }
  }
});

await sql.end();
console.log(`Seeded ${products.length} DIVA products with live variants, offers and inventory.`);
