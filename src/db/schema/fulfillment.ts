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
import {localeEnum} from './catalog';
import {orders} from './orders';

export const shippingMethods = pgTable(
  'shipping_methods',
  {
    code: text('code').primaryKey(),
    active: boolean('active').notNull().default(true),
    priceMinor: integer('price_minor').notNull().default(0),
    currency: varchar('currency', {length: 3}).notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', {withTimezone: true}).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', {withTimezone: true}).notNull().defaultNow()
  },
  (table) => [
    index('shipping_methods_active_sort_idx').on(table.active, table.sortOrder),
    check('shipping_methods_price_nonnegative', sql`${table.priceMinor} >= 0`)
  ]
);

export const shippingMethodTranslations = pgTable(
  'shipping_method_translations',
  {
    methodCode: text('method_code')
      .notNull()
      .references(() => shippingMethods.code, {onDelete: 'cascade'}),
    locale: localeEnum('locale').notNull(),
    name: text('name').notNull(),
    description: text('description')
  },
  (table) => [primaryKey({columns: [table.methodCode, table.locale]})]
);

export const paymentAttemptStatusEnum = pgEnum('payment_attempt_status', [
  'created',
  'pending',
  'paid',
  'failed',
  'cancelled',
  'refunded'
]);

export const paymentAttempts = pgTable(
  'payment_attempts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, {onDelete: 'cascade'}),
    provider: text('provider').notNull(),
    providerReference: text('provider_reference'),
    idempotencyKey: text('idempotency_key').notNull(),
    status: paymentAttemptStatusEnum('status').notNull().default('created'),
    amountMinor: integer('amount_minor').notNull(),
    currency: varchar('currency', {length: 3}).notNull(),
    checkoutUrl: text('checkout_url'),
    createdAt: timestamp('created_at', {withTimezone: true}).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', {withTimezone: true}).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex('payment_attempts_idempotency_unique').on(table.idempotencyKey),
    uniqueIndex('payment_attempts_provider_reference_unique').on(table.provider, table.providerReference),
    index('payment_attempts_order_id_idx').on(table.orderId),
    index('payment_attempts_status_idx').on(table.status),
    check('payment_attempts_amount_nonnegative', sql`${table.amountMinor} >= 0`)
  ]
);
