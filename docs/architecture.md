# Architecture

DIVA is one Next.js full-stack application with strong internal boundaries. A separate API service is not introduced until another client or scaling requirement makes it useful.

```text
src/
├── app/          routes, layouts and server entry points
├── components/   reusable UI and layout primitives
├── db/           PostgreSQL client and Drizzle schema
├── i18n/         locale routing and request configuration
├── lib/          cross-cutting server integrations such as auth
└── features/     commerce domains and use-cases
```

Current and planned commerce domains:

```text
features/
├── catalog/      storefront contract + PostgreSQL repository
├── inventory/    atomic stock reservation/release
├── cart/         next phase
├── checkout/     next phase
├── orders/       next phase
├── customers/    auth backend implemented; customer UI next
└── admin/        planned
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

Drizzle owns the database model in `src/db/schema`. The initial migration creates localized collections and products, product images, colors, sizes, sellable variants and one inventory record per variant. Variant prices are stored as integer minor units alongside a three-letter currency code; unpublished variants may keep price fields empty until merchandising completes them.

Inventory stores `onHand` and `reserved` separately. The inventory service updates reservations with conditional SQL so concurrent requests cannot reserve more stock than is available.

## Authentication

Better Auth is mounted at `/api/auth/[...all]` and uses the same PostgreSQL connection through the Drizzle adapter. The schema contains Better Auth's user, session, account and verification models. Email/password authentication is enabled. The application owns `role` and `locale` user fields rather than accepting them from untrusted sign-up input.

Server runtime configuration is validated when database or authentication code is first used, so production requests cannot silently run with missing credentials.

## Catalog boundary

The existing in-code catalog remains the presentation fixture while the backend is provisioned. The PostgreSQL repository now exposes active-product listing and localized product detail queries behind the same catalog domain. This keeps pages independent from Drizzle and allows the next customer-commerce phase to switch reads to persistence after real merchandising data is loaded.

## Internationalization

Locale URLs are explicit: `/ar`, `/en`, `/de` and `/ru`. Arabic switches the root document to RTL. Interface copy lives in locale messages. Persistent product, color and collection copy is stored by locale so catalog records can be localized without duplicating product identity or inventory.

## Themes

The visual system is derived from the supplied DIVA mark: warm ivory, espresso, champagne gold and bronze. Dark mode uses deep espresso surfaces rather than neutral black so the brand remains visually consistent.

## Next implementation boundary

Customer commerce comes next: authenticated account surfaces, cart and wishlist state, checkout validation, order creation, payment-provider integration and shipping methods. Those features consume catalog variants and inventory through domain services rather than writing stock directly.
