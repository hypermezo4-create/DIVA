# DIVA

DIVA is a multilingual luxury-footwear storefront being built from scratch around the **DIVA Premium Mirror** identity.

## Current stack

- Next.js 16 App Router + React 19 + TypeScript
- Tailwind CSS 4 design tokens and responsive layout
- `next-intl` locale routing for Arabic, English, German and Russian
- True RTL document direction for Arabic
- Light, dark and system themes with `next-themes`
- Motion-based hero transitions with reduced-motion support
- PostgreSQL + Drizzle ORM for commerce persistence
- Better Auth for database-backed customer sessions

## Implemented surfaces

- Luxury home page and global brand shell
- `/ar`, `/en`, `/de` and `/ru` locale routes
- Filterable `/[locale]/shop` catalog
- Localized `/[locale]/product/[slug]` detail pages
- Audience, new-arrival and collection filtering
- PostgreSQL schema for products, translations, images, variants, sizes, colors and inventory
- Atomic stock reservation and release service
- Email/password authentication API at `/api/auth/[...all]`

## Local development

```bash
npm install
docker compose up -d postgres
cp .env.example .env.local
npm run db:migrate
npm run dev
```

Replace `BETTER_AUTH_SECRET` in `.env.local` with a random secret of at least 32 characters before using authentication.

Open `http://localhost:3000`. Locale routing redirects to a supported locale such as `/en`.

## Database commands

```bash
npm run db:generate
npm run db:migrate
npm run db:studio
```

The initial SQL migration lives in `drizzle/0000_commerce_core.sql`.

## Quality checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Delivery roadmap

1. Foundation and design system — complete
2. Catalog and product experience — complete
3. Commerce backend — complete in code; deployment requires a PostgreSQL connection and auth secret
4. Customer commerce — cart, wishlist, account UI, checkout, orders, payments and shipping
5. Admin operations — products, stock, orders, customers, content and translations
6. Production hardening — tests, accessibility, security, SEO, performance and deployment

See [`docs/architecture.md`](docs/architecture.md) for the current boundaries.
