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
- Primary store pillars: Women, Men, Kids and Offers
- PostgreSQL-backed `/[locale]/shop` catalog with live prices, compare-at offers and stock availability
- Localized `/[locale]/product/[slug]` detail pages with real variants, offer pricing, size/color selection and inventory-aware purchasing controls
- PostgreSQL schema for products, translations, images, variants, sizes, colors, inventory, carts, wishlists, orders and order items
- Email/password authentication API at `/api/auth/[...all]`
- Localized `/[locale]/account` sign-in, registration, session and sign-out experience
- Guest cart and wishlist state with live server-side quoting against current catalog data
- Database-backed customer carts and wishlists with guest-state merge after sign-in
- Localized `/[locale]/cart` and `/[locale]/wishlist` pages plus global header counters
- Localized `/[locale]/checkout` with customer/contact address capture and standard-shipping selection
- Final checkout price/stock validation and atomic inventory reservation inside the order transaction
- Pending-payment order creation with immutable line snapshots and token-protected confirmation pages

## Local development

```bash
npm install
docker compose up -d postgres
cp .env.example .env.local
npm run db:migrate
npm run db:seed
npm run dev
```

Replace `BETTER_AUTH_SECRET` in `.env.local` with a random secret of at least 32 characters before using authentication.

Open `http://localhost:3000`. Locale routing redirects to a supported locale such as `/en`.

## Database commands

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:studio
```

Tracked SQL migrations live in `drizzle/`. `npm run db:migrate` applies them through the repository migration ledger and rejects edited migrations that were already applied. `npm run db:seed` repeatably loads the current DIVA merchandising demo catalog with variants, USD demo prices, compare-at offers and inventory.

## Quality checks

```bash
npm run test:smoke
npm run lint
npm run typecheck
npm run build
```

GitHub Actions provisions PostgreSQL, applies migrations, seeds the catalog, verifies catalog/offers/cart/wishlist/order persistence with the commerce smoke test, then runs lint, typecheck and production build on `main` pushes and pull requests.

## Delivery roadmap

1. Foundation and design system — complete
2. Catalog and product experience — complete
3. Commerce backend — implemented; production still requires real database/auth environment provisioning and runtime validation
4. Customer commerce — in progress: accounts, live catalog, Women/Men/Kids/Offers, cart, wishlist, checkout and pending-payment orders are implemented; payment provider, production shipping rules and order lifecycle automation remain
5. Admin operations — products, stock, offers, orders, customers, content and translations
6. Production hardening — tests, accessibility, security, SEO, performance and deployment

See [`docs/architecture.md`](docs/architecture.md) for the current boundaries.
