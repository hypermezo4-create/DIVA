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
- Better Auth for database-backed customer sessions and role-aware admin access

## Implemented surfaces

- Luxury home page and global brand shell
- `/ar`, `/en`, `/de` and `/ru` locale routes
- Primary store pillars: Women, Men, Kids and Offers
- PostgreSQL-backed `/[locale]/shop` catalog with live prices, compare-at offers and stock availability
- Localized `/[locale]/product/[slug]` detail pages with real variants, offer pricing, size/color selection and inventory-aware purchasing controls
- Email/password authentication plus signed-in customer account experience
- Guest and account cart/wishlist flows with server-authoritative prices and stock
- Localized checkout with contact/address capture and database-backed shipping-method selection
- Final server validation of product price, shipping price and inventory before order creation
- Atomic stock reservation for pending-payment orders
- Payment-attempt persistence and a provider adapter boundary ready for the selected production gateway
- Order lifecycle services for payment confirmation and safe pending-order cancellation/release
- Token-protected guest order confirmation pages
- Signed-in `/[locale]/account/orders` history and owned order-detail pages
- Customer cancellation of eligible pending-payment orders with inventory release
- Role-protected localized `/[locale]/admin` operations workspace
- Admin dashboard with catalog, inventory, offers, customer and order signals
- Product publish/archive/new-arrival controls
- SKU stock, active price and compare-at offer controls with reserved-stock protection
- Paid-order fulfilment progression plus safe pending-order cancellation
- Customer directory with account role and order-count visibility
- Database-backed multilingual home/footer content overrides with file-message fallback
- Admin editorial desk for Arabic, English, German and Russian storefront copy
- Production security headers, HSTS/CSP baseline and cross-site mutation guards
- Canonical/language metadata, JSON-LD, robots policy and localized sitemap
- Private-route `noindex` boundaries for account, cart, checkout, wishlist, order and admin surfaces
- Database-backed `/api/health` readiness endpoint and built-runtime smoke checks
- Global keyboard focus and high-contrast accessibility affordances

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

Tracked SQL migrations live in `drizzle/`. `npm run db:migrate` applies them through the repository migration ledger and rejects edited migrations that were already applied. `npm run db:seed` loads the merchandising demo catalog plus current shipping configuration.

## Admin access

Customer sign-up can never request the admin role. Promote or demote an existing account from a trusted environment with database access:

```bash
npm run admin:role -- admin@example.com admin
npm run admin:role -- admin@example.com customer
```

After promotion, the account page exposes the localized admin operations entry. Admin pages and mutation APIs both verify the authenticated role on the server.

## Quality checks

```bash
npm run test:smoke
npm run lint
npm run typecheck
npm run build
```

After starting a production build against a migrated/seeded database:

```bash
npm start
npm run test:runtime
```

The commerce smoke test covers catalog/offers, shipping configuration, cart/wishlist persistence, orders, payment attempts, cancelled payment/order states, admin-role persistence and editable storefront-content persistence. The runtime smoke verifies database health, security headers, canonical metadata, crawl policy and cross-site mutation rejection.

GitHub Actions uses `npm ci`, provisions PostgreSQL, migrates/seeds it, runs the commerce checks, lint, typecheck and production build, then boots the built server and runs the runtime hardening smoke suite.

## Delivery roadmap

1. Foundation and design system — complete
2. Catalog and product experience — complete
3. Commerce backend — implemented; production still requires real environment provisioning and runtime validation
4. Customer commerce — checkout, configurable shipping, order history, payment-attempt boundary and cancellation lifecycle implemented; provider-specific payment handoff/webhooks and final production shipping rules remain
5. Admin operations — core operational surface implemented: dashboard, products, stock, offers, orders, customers, content and multilingual storefront copy
6. Production hardening — in progress: security headers, CSRF-origin guards, health checks, SEO/crawl controls, structured data, accessibility focus states and built-runtime CI checks are implemented; deeper E2E, accessibility/performance measurement, observability and verified deployment remain

See [`docs/architecture.md`](docs/architecture.md) for the current boundaries and [`docs/production.md`](docs/production.md) for the production operations checklist.
