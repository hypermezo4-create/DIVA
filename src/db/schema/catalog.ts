import {sql} from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar
} from 'drizzle-orm/pg-core';

export const localeEnum = pgEnum('locale_code', ['en', 'ar', 'de', 'ru']);
export const audienceEnum = pgEnum('catalog_audience', ['women', 'men', 'kids']);
export const familyEnum = pgEnum('product_family', ['sneaker', 'heel', 'loafer', 'boot', 'sandal']);
export const productStatusEnum = pgEnum('product_status', ['draft', 'active', 'archived']);

export const collections = pgTable(
  'collections',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: text('slug').notNull(),
    createdAt: timestamp('created_at', {withTimezone: true}).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', {withTimezone: true}).notNull().defaultNow()
  },
  (table) => [uniqueIndex('collections_slug_unique').on(table.slug)]
);

export const collectionTranslations = pgTable(
  'collection_translations',
  {
    collectionId: uuid('collection_id')
      .notNull()
      .references(() => collections.id, {onDelete: 'cascade'}),
    locale: localeEnum('locale').notNull(),
    name: text('name').notNull(),
    description: text('description')
  },
  (table) => [primaryKey({columns: [table.collectionId, table.locale]})]
);

export const products = pgTable(
  'products',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: text('slug').notNull(),
    audience: audienceEnum('audience').notNull(),
    family: familyEnum('family').notNull(),
    status: productStatusEnum('status').notNull().default('draft'),
    newArrival: boolean('new_arrival').notNull().default(false),
    collectionId: uuid('collection_id').references(() => collections.id, {onDelete: 'set null'}),
    createdAt: timestamp('created_at', {withTimezone: true}).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', {withTimezone: true}).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex('products_slug_unique').on(table.slug),
    index('products_audience_idx').on(table.audience),
    index('products_status_idx').on(table.status),
    index('products_collection_id_idx').on(table.collectionId)
  ]
);

export const productTranslations = pgTable(
  'product_translations',
  {
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, {onDelete: 'cascade'}),
    locale: localeEnum('locale').notNull(),
    name: text('name').notNull(),
    subtitle: text('subtitle').notNull(),
    description: text('description').notNull()
  },
  (table) => [primaryKey({columns: [table.productId, table.locale]})]
);

export const productImages = pgTable(
  'product_images',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, {onDelete: 'cascade'}),
    url: text('url').notNull(),
    altText: text('alt_text'),
    sortOrder: integer('sort_order').notNull().default(0)
  },
  (table) => [
    index('product_images_product_id_idx').on(table.productId),
    uniqueIndex('product_images_order_unique').on(table.productId, table.sortOrder)
  ]
);

export const colors = pgTable(
  'colors',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    code: text('code').notNull(),
    hex: varchar('hex', {length: 7}).notNull()
  },
  (table) => [uniqueIndex('colors_code_unique').on(table.code)]
);

export const colorTranslations = pgTable(
  'color_translations',
  {
    colorId: uuid('color_id')
      .notNull()
      .references(() => colors.id, {onDelete: 'cascade'}),
    locale: localeEnum('locale').notNull(),
    label: text('label').notNull()
  },
  (table) => [primaryKey({columns: [table.colorId, table.locale]})]
);

export const sizes = pgTable(
  'sizes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    code: text('code').notNull(),
    label: text('label').notNull(),
    sortOrder: integer('sort_order').notNull().default(0)
  },
  (table) => [uniqueIndex('sizes_code_unique').on(table.code)]
);

export const productVariants = pgTable(
  'product_variants',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, {onDelete: 'cascade'}),
    colorId: uuid('color_id')
      .notNull()
      .references(() => colors.id, {onDelete: 'restrict'}),
    sizeId: uuid('size_id')
      .notNull()
      .references(() => sizes.id, {onDelete: 'restrict'}),
    sku: text('sku').notNull(),
    priceMinor: integer('price_minor'),
    compareAtMinor: integer('compare_at_minor'),
    currency: varchar('currency', {length: 3}),
    active: boolean('active').notNull().default(false),
    createdAt: timestamp('created_at', {withTimezone: true}).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', {withTimezone: true}).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex('product_variants_sku_unique').on(table.sku),
    uniqueIndex('product_variants_option_unique').on(table.productId, table.colorId, table.sizeId),
    index('product_variants_product_id_idx').on(table.productId),
    check('product_variants_price_nonnegative', sql`${table.priceMinor} is null or ${table.priceMinor} >= 0`),
    check('product_variants_compare_at_nonnegative', sql`${table.compareAtMinor} is null or ${table.compareAtMinor} >= 0`)
  ]
);

export const inventory = pgTable(
  'inventory',
  {
    variantId: uuid('variant_id')
      .primaryKey()
      .references(() => productVariants.id, {onDelete: 'cascade'}),
    onHand: integer('on_hand').notNull().default(0),
    reserved: integer('reserved').notNull().default(0),
    updatedAt: timestamp('updated_at', {withTimezone: true}).notNull().defaultNow()
  },
  (table) => [
    check('inventory_on_hand_nonnegative', sql`${table.onHand} >= 0`),
    check('inventory_reserved_nonnegative', sql`${table.reserved} >= 0`),
    check('inventory_reserved_not_above_stock', sql`${table.reserved} <= ${table.onHand}`)
  ]
);
