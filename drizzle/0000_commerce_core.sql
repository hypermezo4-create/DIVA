CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "locale_code" AS ENUM ('en', 'ar', 'de', 'ru');
CREATE TYPE "catalog_audience" AS ENUM ('women', 'men', 'kids');
CREATE TYPE "product_family" AS ENUM ('sneaker', 'heel', 'loafer', 'boot', 'sandal');
CREATE TYPE "product_status" AS ENUM ('draft', 'active', 'archived');

CREATE TABLE "user" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "email_verified" boolean DEFAULT false NOT NULL,
  "image" text,
  "role" text DEFAULT 'customer' NOT NULL,
  "locale" text DEFAULT 'en' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX "user_email_unique" ON "user" ("email");

CREATE TABLE "session" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "token" text NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "ip_address" text,
  "user_agent" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX "session_token_unique" ON "session" ("token");
CREATE INDEX "session_user_id_idx" ON "session" ("user_id");

CREATE TABLE "account" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "account_id" text NOT NULL,
  "provider_id" text NOT NULL,
  "access_token" text,
  "refresh_token" text,
  "access_token_expires_at" timestamp with time zone,
  "refresh_token_expires_at" timestamp with time zone,
  "scope" text,
  "id_token" text,
  "password" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX "account_user_id_idx" ON "account" ("user_id");
CREATE UNIQUE INDEX "account_provider_unique" ON "account" ("provider_id", "account_id");

CREATE TABLE "verification" (
  "id" text PRIMARY KEY NOT NULL,
  "identifier" text NOT NULL,
  "value" text NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX "verification_identifier_idx" ON "verification" ("identifier");

CREATE TABLE "collections" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "slug" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX "collections_slug_unique" ON "collections" ("slug");

CREATE TABLE "collection_translations" (
  "collection_id" uuid NOT NULL REFERENCES "collections"("id") ON DELETE CASCADE,
  "locale" "locale_code" NOT NULL,
  "name" text NOT NULL,
  "description" text,
  PRIMARY KEY ("collection_id", "locale")
);

CREATE TABLE "products" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "slug" text NOT NULL,
  "audience" "catalog_audience" NOT NULL,
  "family" "product_family" NOT NULL,
  "status" "product_status" DEFAULT 'draft' NOT NULL,
  "new_arrival" boolean DEFAULT false NOT NULL,
  "collection_id" uuid REFERENCES "collections"("id") ON DELETE SET NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX "products_slug_unique" ON "products" ("slug");
CREATE INDEX "products_audience_idx" ON "products" ("audience");
CREATE INDEX "products_status_idx" ON "products" ("status");
CREATE INDEX "products_collection_id_idx" ON "products" ("collection_id");

CREATE TABLE "product_translations" (
  "product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "locale" "locale_code" NOT NULL,
  "name" text NOT NULL,
  "subtitle" text NOT NULL,
  "description" text NOT NULL,
  PRIMARY KEY ("product_id", "locale")
);

CREATE TABLE "product_images" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "url" text NOT NULL,
  "alt_text" text,
  "sort_order" integer DEFAULT 0 NOT NULL
);

CREATE INDEX "product_images_product_id_idx" ON "product_images" ("product_id");
CREATE UNIQUE INDEX "product_images_order_unique" ON "product_images" ("product_id", "sort_order");

CREATE TABLE "colors" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "code" text NOT NULL,
  "hex" varchar(7) NOT NULL
);

CREATE UNIQUE INDEX "colors_code_unique" ON "colors" ("code");

CREATE TABLE "color_translations" (
  "color_id" uuid NOT NULL REFERENCES "colors"("id") ON DELETE CASCADE,
  "locale" "locale_code" NOT NULL,
  "label" text NOT NULL,
  PRIMARY KEY ("color_id", "locale")
);

CREATE TABLE "sizes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "code" text NOT NULL,
  "label" text NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL
);

CREATE UNIQUE INDEX "sizes_code_unique" ON "sizes" ("code");

CREATE TABLE "product_variants" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "color_id" uuid NOT NULL REFERENCES "colors"("id") ON DELETE RESTRICT,
  "size_id" uuid NOT NULL REFERENCES "sizes"("id") ON DELETE RESTRICT,
  "sku" text NOT NULL,
  "price_minor" integer,
  "compare_at_minor" integer,
  "currency" varchar(3),
  "active" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "product_variants_price_nonnegative" CHECK ("price_minor" IS NULL OR "price_minor" >= 0),
  CONSTRAINT "product_variants_compare_at_nonnegative" CHECK ("compare_at_minor" IS NULL OR "compare_at_minor" >= 0)
);

CREATE UNIQUE INDEX "product_variants_sku_unique" ON "product_variants" ("sku");
CREATE UNIQUE INDEX "product_variants_option_unique" ON "product_variants" ("product_id", "color_id", "size_id");
CREATE INDEX "product_variants_product_id_idx" ON "product_variants" ("product_id");

CREATE TABLE "inventory" (
  "variant_id" uuid PRIMARY KEY NOT NULL REFERENCES "product_variants"("id") ON DELETE CASCADE,
  "on_hand" integer DEFAULT 0 NOT NULL,
  "reserved" integer DEFAULT 0 NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "inventory_on_hand_nonnegative" CHECK ("on_hand" >= 0),
  CONSTRAINT "inventory_reserved_nonnegative" CHECK ("reserved" >= 0),
  CONSTRAINT "inventory_reserved_not_above_stock" CHECK ("reserved" <= "on_hand")
);
