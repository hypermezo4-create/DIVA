ALTER TABLE "orders" ADD COLUMN "confirmation_token" varchar(64);
UPDATE "orders" SET "confirmation_token" = replace(gen_random_uuid()::text, '-', '') WHERE "confirmation_token" IS NULL;
ALTER TABLE "orders" ALTER COLUMN "confirmation_token" SET NOT NULL;
CREATE UNIQUE INDEX "orders_confirmation_token_unique" ON "orders" ("confirmation_token");
