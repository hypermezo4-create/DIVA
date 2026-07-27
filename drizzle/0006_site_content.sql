CREATE TABLE "site_content" (
  "key" text NOT NULL,
  "locale" "locale_code" NOT NULL,
  "value" text NOT NULL,
  "updated_by" text REFERENCES "user"("id") ON DELETE SET NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY ("key", "locale")
);

CREATE INDEX "site_content_updated_at_idx" ON "site_content" ("updated_at");
