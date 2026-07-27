CREATE TYPE "order_status" AS ENUM ('pending_payment', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE "payment_status" AS ENUM ('pending', 'paid', 'failed', 'refunded');

CREATE TABLE "orders" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "number" varchar(32) NOT NULL,
  "user_id" text REFERENCES "user"("id") ON DELETE SET NULL,
  "status" "order_status" DEFAULT 'pending_payment' NOT NULL,
  "payment_status" "payment_status" DEFAULT 'pending' NOT NULL,
  "customer_name" text NOT NULL,
  "email" text NOT NULL,
  "phone" text NOT NULL,
  "address_line_1" text NOT NULL,
  "address_line_2" text,
  "city" text NOT NULL,
  "region" text,
  "postal_code" text,
  "country_code" varchar(2) NOT NULL,
  "shipping_method" text NOT NULL,
  "currency" varchar(3) NOT NULL,
  "subtotal_minor" integer NOT NULL,
  "shipping_minor" integer DEFAULT 0 NOT NULL,
  "total_minor" integer NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "orders_subtotal_nonnegative" CHECK ("subtotal_minor" >= 0),
  CONSTRAINT "orders_shipping_nonnegative" CHECK ("shipping_minor" >= 0),
  CONSTRAINT "orders_total_nonnegative" CHECK ("total_minor" >= 0)
);

CREATE UNIQUE INDEX "orders_number_unique" ON "orders" ("number");
CREATE INDEX "orders_user_id_idx" ON "orders" ("user_id");
CREATE INDEX "orders_status_idx" ON "orders" ("status");
CREATE INDEX "orders_created_at_idx" ON "orders" ("created_at");

CREATE TABLE "order_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "order_id" uuid NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
  "variant_id" uuid NOT NULL REFERENCES "product_variants"("id") ON DELETE RESTRICT,
  "sku" text NOT NULL,
  "product_name" text NOT NULL,
  "size_label" text NOT NULL,
  "color_label" text NOT NULL,
  "unit_price_minor" integer NOT NULL,
  "quantity" integer NOT NULL,
  "line_total_minor" integer NOT NULL,
  CONSTRAINT "order_items_quantity_positive" CHECK ("quantity" > 0),
  CONSTRAINT "order_items_unit_price_nonnegative" CHECK ("unit_price_minor" >= 0),
  CONSTRAINT "order_items_line_total_nonnegative" CHECK ("line_total_minor" >= 0)
);

CREATE INDEX "order_items_order_id_idx" ON "order_items" ("order_id");
CREATE INDEX "order_items_variant_id_idx" ON "order_items" ("variant_id");
