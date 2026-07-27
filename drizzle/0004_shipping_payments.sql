CREATE TABLE "shipping_methods" (
  "code" text PRIMARY KEY NOT NULL,
  "active" boolean DEFAULT true NOT NULL,
  "price_minor" integer DEFAULT 0 NOT NULL,
  "currency" varchar(3) NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "shipping_methods_price_nonnegative" CHECK ("price_minor" >= 0)
);

CREATE INDEX "shipping_methods_active_sort_idx" ON "shipping_methods" ("active", "sort_order");

CREATE TABLE "shipping_method_translations" (
  "method_code" text NOT NULL REFERENCES "shipping_methods"("code") ON DELETE CASCADE,
  "locale" "locale_code" NOT NULL,
  "name" text NOT NULL,
  "description" text,
  PRIMARY KEY ("method_code", "locale")
);

CREATE TYPE "payment_attempt_status" AS ENUM ('created', 'pending', 'paid', 'failed', 'refunded');

CREATE TABLE "payment_attempts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "order_id" uuid NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
  "provider" text NOT NULL,
  "provider_reference" text,
  "idempotency_key" text NOT NULL,
  "status" "payment_attempt_status" DEFAULT 'created' NOT NULL,
  "amount_minor" integer NOT NULL,
  "currency" varchar(3) NOT NULL,
  "checkout_url" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "payment_attempts_amount_nonnegative" CHECK ("amount_minor" >= 0)
);

CREATE UNIQUE INDEX "payment_attempts_idempotency_unique" ON "payment_attempts" ("idempotency_key");
CREATE UNIQUE INDEX "payment_attempts_provider_reference_unique" ON "payment_attempts" ("provider", "provider_reference");
CREATE INDEX "payment_attempts_order_id_idx" ON "payment_attempts" ("order_id");
CREATE INDEX "payment_attempts_status_idx" ON "payment_attempts" ("status");
