import {sql} from 'drizzle-orm';
import {check, index, integer, pgTable, primaryKey, text, timestamp, uniqueIndex, uuid} from 'drizzle-orm/pg-core';
import {user} from './auth';
import {products, productVariants} from './catalog';

export const wishlists = pgTable(
  'wishlists',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, {onDelete: 'cascade'}),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, {onDelete: 'cascade'}),
    createdAt: timestamp('created_at', {withTimezone: true}).notNull().defaultNow()
  },
  (table) => [
    primaryKey({columns: [table.userId, table.productId]}),
    index('wishlists_product_id_idx').on(table.productId)
  ]
);

export const carts = pgTable(
  'carts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, {onDelete: 'cascade'}),
    createdAt: timestamp('created_at', {withTimezone: true}).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', {withTimezone: true}).notNull().defaultNow()
  },
  (table) => [uniqueIndex('carts_user_id_unique').on(table.userId)]
);

export const cartItems = pgTable(
  'cart_items',
  {
    cartId: uuid('cart_id')
      .notNull()
      .references(() => carts.id, {onDelete: 'cascade'}),
    variantId: uuid('variant_id')
      .notNull()
      .references(() => productVariants.id, {onDelete: 'cascade'}),
    quantity: integer('quantity').notNull().default(1),
    createdAt: timestamp('created_at', {withTimezone: true}).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', {withTimezone: true}).notNull().defaultNow()
  },
  (table) => [
    primaryKey({columns: [table.cartId, table.variantId]}),
    index('cart_items_variant_id_idx').on(table.variantId),
    check('cart_items_quantity_positive', sql`${table.quantity} > 0`),
    check('cart_items_quantity_reasonable', sql`${table.quantity} <= 20`)
  ]
);
