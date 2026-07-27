# Architecture

DIVA is one Next.js full-stack application with strong internal boundaries. A separate API service is not introduced until another client or scaling requirement makes it useful.

```text
src/
├── app/          routes, layouts and server entry points
├── components/   reusable UI, layout and commerce interaction primitives
├── db/           PostgreSQL client and Drizzle schema
├── i18n/         locale routing and request configuration
├── lib/          cross-cutting server integrations such as auth
└── features/     commerce domains and use-cases
```

Current and planned commerce domains:

```text
features/
├── catalog/              live storefront contract + PostgreSQL repository
├── inventory/            atomic stock reservation/release
├── customer-commerce/    cart + wishlist contracts and persistence
├── checkout/             next customer-commerce slice
├── orders/               planned
├── customers/            Better Auth backend + localized account UI
└── admin/                planned
```

The dependency direction remains:

```text
Routes / UI
    ↓
Feature use-cases
    ↓
Data access
    ↓
PostgreSQL and external providers
```

## Persistence

Drizzle owns the database model in `src/db/schema`. The catalog model contains localized collections and products, product images, colors, sizes, sellable variants and one inventory record per variant. Variant prices are stored as integer minor units alongside a three-letter currency code.

Customer commerce adds one account cart per user, cart items keyed by variant, and wishlist entries keyed by user and product. Cart quantities are constrained to positive bounded values. Guest state is intentionally not written to the database before authentication.

Tracked SQL files in `drizzle/` are applied by `scripts/migrate.mjs`. The migration runner records migration names and checksums in PostgreSQL so an already-applied migration cannot be silently rewritten. `scripts/seed-catalog.mjs` provides repeatable demo merchandising data for development and CI.

## Inventory

Inventory stores `onHand` and `reserved` separately. Cart operations read current availability but do not reserve stock. This avoids abandoned carts locking inventory. Reservation remains an order/checkout concern: checkout will revalidate the selected variant, price and availability and then call the inventory service to reserve stock atomically.

## Authentication

Better Auth is mounted at `/api/auth/[...all]` and uses the same PostgreSQL connection through the Drizzle adapter. The schema contains Better Auth's user, session, account and verification models. Email/password authentication is enabled. The application owns `role` and `locale` user fields rather than accepting them from untrusted sign-up input.

The localized `/[locale]/account` surface uses the Better Auth browser client for registration, sign-in, session display and sign-out. Authenticated cart and wishlist API routes resolve the current user from the session headers before accessing account-owned data.

## Catalog boundary

`/[locale]/shop` and `/[locale]/product/[slug]` now read active products from PostgreSQL. Catalog queries expose localized product and collection copy, current imagery, sellable variant prices and inventory availability while keeping route components independent from Drizzle.

Product details expose real variant identifiers to the client purchase control. Size/color selection therefore maps to one concrete SKU rather than a presentation-only option.

## Cart and wishlist boundary

`CommerceProvider` owns browser interaction state. Signed-in customers use database-backed `/api/cart` and `/api/wishlist` endpoints. Guests keep only variant quantities and product IDs in local storage, then call public quote endpoints to hydrate that identity-only state with current server-authoritative product copy, price and availability.

When a guest signs in, guest cart and wishlist entries are copied into the account stores. Entries that cannot be accepted remain in guest storage instead of being silently discarded. All cart display prices and stock levels are refreshed from PostgreSQL; local storage is never authoritative for price or availability.

The current cart supports quantity changes, removal, subtotal calculation and live availability. Wishlist supports save/remove and localized product hydration. Checkout is deliberately disabled until the order and payment boundary is implemented.

## Internationalization

Locale URLs are explicit: `/ar`, `/en`, `/de` and `/ru`. Arabic switches the root document to RTL. Interface copy lives in locale messages. Persistent product, color and collection copy is stored by locale so catalog records can be localized without duplicating product identity or inventory.

## Themes and responsive behavior

The visual system is derived from the supplied DIVA mark: warm ivory, espresso, champagne gold and bronze. Dark mode uses deep espresso surfaces rather than neutral black so the brand remains visually consistent. Account, wishlist and cart controls remain available in the compact mobile header without exposing desktop navigation text.

## Next implementation boundary

Checkout comes next: customer/address capture, shipping method selection, final server-side price and stock validation, atomic inventory reservation, order creation and payment-provider handoff. The checkout flow must treat cart state as intent only and create orders from freshly validated server data.
