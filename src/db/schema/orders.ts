import {sql} from 'drizzle-orm';
import {check, index, integer, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid, varchar} from 'drizzle-orm/pg-core';
import {user} from './auth';
import {productVariants} from './catalog';

export const orderStatusEnum = pgEnum('order_status', [
  'pending_payment',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled'
]);

export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'paid', 'failed', 'refunded']);

export const orders = pgTable(
  'orders',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    number: varchar('number', {length: 32}).notNull(),
    userId: text('user_id').references(() => user.id, {onDelete: 'set null'}),
    status: orderStatusEnum('status').notNull().default('pending_payment'),
    paymentStatus: paymentStatusEnum('payment_status').notNull().default('pending'),
    customerName: text('customer_name').notNull(),
    email: text('email').notNull(),
    phone: text('phone').notNull(),
    addressLine1: text('address_line_1').notNull(),
    addressLine2: text('address_line_2'),
    city: text('city').notNull(),
    region: text('region'),
    postalCode: text('postal_code'),
    countryCode: varchar('country_code', {length: 2}).notNull(),
    shippingMethod: text('shipping_method').notNull(),
    currency: varchar('currency', {length: 3}).notNull(),
    subtotalMinor: integer('subtotal_minor').notNull(),
    shippingMinor: integer('shipping_minor').notNull().default(0),
    totalMinor: integer('total_minor').notNull(),
    createdAt: timestamp('created_at', {withTimezone: true}).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', {withTimezone: true}).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex('orders_number_unique').on(table.number),
    index('orders_user_id_idx').on(table.userId),
    index('orders_status_idx').on(table.status),
    index('orders_created_at_idx').on(table.createdAt),
    check('orders_subtotal_nonnegative', sql`${table.subtotalMinor} >= 0`),
    check('orders_shipping_nonnegative', sql`${table.shippingMinor} >= 0`),
    check('orders_total_nonnegative', sql`${table.totalMinor} >= 0`)
  ]
);

export const orderItems = pgTable(
  'order_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, {onDelete: 'cascade'}),
    variantId: uuid('variant_id')
      .notNull()
      .references(() => productVariants.id, {onDelete: 'restrict'}),
    sku: text('sku').notNull(),
    productName: text('product_name').notNull(),
    sizeLabel: text('size_label').notNull(),
    colorLabel: text('color_label').notNull(),
    unitPriceMinor: integer('unit_price_minor').notNull(),
    quantity: integer('quantity').notNull(),
    lineTotalMinor: integer('line_total_minor').notNull()
  },
  (table) => [
    index('order_items_order_id_idx').on(table.orderId),
    index('order_items_variant_id_idx').on(table.variantId),
    check('order_items_quantity_positive', sql`${table.quantity} > 0`),
    check('order_items_unit_price_nonnegative', sql`${table.unitPriceMinor} >= 0`),
    check('order_items_line_total_nonnegative', sql`${table.lineTotalMinor} >= 0`)
  ]
);
