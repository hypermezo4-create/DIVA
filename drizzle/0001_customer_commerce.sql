CREATE TABLE "wishlists" (
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY ("user_id", "product_id")
);

CREATE INDEX "wishlists_product_id_idx" ON "wishlists" ("product_id");

CREATE TABLE "carts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX "carts_user_id_unique" ON "carts" ("user_id");

CREATE TABLE "cart_items" (
  "cart_id" uuid NOT NULL REFERENCES "carts"("id") ON DELETE CASCADE,
  "variant_id" uuid NOT NULL REFERENCES "product_variants"("id") ON DELETE CASCADE,
  "quantity" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY ("cart_id", "variant_id"),
  CONSTRAINT "cart_items_quantity_positive" CHECK ("quantity" > 0),
  CONSTRAINT "cart_items_quantity_reasonable" CHECK ("quantity" <= 20)
);

CREATE INDEX "cart_items_variant_id_idx" ON "cart_items" ("variant_id");
