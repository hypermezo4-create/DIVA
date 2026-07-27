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
├── catalog/              live storefront + Women/Men/Kids/Offers queries
├── inventory/            atomic stock reservation/release
├── customer-commerce/    cart + wishlist contracts and persistence
├── checkout/             server-authoritative validation + order transaction
├── orders/               confirmation reads and future lifecycle operations
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

Drizzle owns the database model in `src/db/schema`. The catalog model contains localized collections and products, product images, colors, sizes, sellable variants and one inventory record per variant. Variant prices are stored as integer minor units alongside a three-letter currency code. Offers are represented by a `compareAtMinor` value greater than the active selling price, so offer membership is derived from server data rather than a client-only flag.

Customer commerce adds one account cart per user, cart items keyed by variant, and wishlist entries keyed by user and product. Checkout adds orders and immutable order-item snapshots containing the SKU, localized product name, option labels, quantity and price used when the order was created.

Tracked SQL files in `drizzle/` are applied by `scripts/migrate.mjs`. The migration runner records migration names and checksums in PostgreSQL so an already-applied migration cannot be silently rewritten. `scripts/seed-catalog.mjs` provides repeatable demo merchandising data for development and CI, including offers across Women, Men and Kids.

## Inventory

Inventory stores `onHand` and `reserved` separately. Cart operations read current availability but do not reserve stock, avoiding abandoned carts locking inventory.

Checkout treats cart content as purchase intent only. Inside one database transaction it reloads active variants, current localized option data and current prices, validates one currency, atomically increments `reserved` only when sufficient available stock remains, creates the order and item snapshots, and clears the signed-in cart. Any failure rolls the transaction back, including inventory reservations made earlier in the same attempt.

Pending-payment reservations will be completed or released by the payment/order-lifecycle integration. Production payment timeout and cancellation automation remain part of the next commerce boundary.

## Authentication and order privacy

Better Auth is mounted at `/api/auth/[...all]` and uses the same PostgreSQL connection through the Drizzle adapter. The schema contains Better Auth's user, session, account and verification models. Email/password authentication is enabled. The application owns `role` and `locale` user fields rather than accepting them from untrusted sign-up input.

The localized `/[locale]/account` surface uses the Better Auth browser client for registration, sign-in, session display and sign-out. Authenticated cart and wishlist API routes resolve the current user from session headers before accessing account-owned data.

Checkout supports both guests and authenticated customers. Order confirmation pages require both the public order number and a high-entropy confirmation token, and are marked `noindex`, so knowing or guessing an order number alone is insufficient to retrieve the order summary.

## Catalog boundary

`/[locale]/shop` and `/[locale]/product/[slug]` read active products from PostgreSQL. The primary customer-facing taxonomy is Women, Men, Kids and Offers. Catalog queries expose localized product and collection copy, current imagery, active/compare-at prices and inventory availability while keeping route components independent from Drizzle.

Product details expose real variant identifiers to the client purchase control. Size/color selection therefore maps to one concrete SKU rather than a presentation-only option.

## Cart and wishlist boundary

`CommerceProvider` owns browser interaction state. Signed-in customers use database-backed `/api/cart` and `/api/wishlist` endpoints. Guests keep only variant quantities and product IDs in local storage, then call public quote endpoints to hydrate that identity-only state with current server-authoritative product copy, price and availability.

When a guest signs in, guest cart and wishlist entries are copied into the account stores. Entries that cannot be accepted remain in guest storage instead of being silently discarded. All cart display prices and stock levels are refreshed from PostgreSQL; local storage is never authoritative for price or availability.

The cart supports quantity changes, removal, subtotal calculation and live availability. Wishlist supports save/remove and localized product hydration. Checkout then performs its own final validation instead of trusting cart totals.

## Internationalization

Locale URLs are explicit: `/ar`, `/en`, `/de` and `/ru`. Arabic switches the root document to RTL. Interface copy lives in locale messages. Persistent product, color and collection copy is stored by locale so catalog records can be localized without duplicating product identity or inventory.

## Themes and responsive behavior

The visual system is derived from the supplied DIVA mark: warm ivory, espresso, champagne gold and bronze. Dark mode uses deep espresso surfaces rather than neutral black so the brand remains visually consistent. The four store pillars—Women, Men, Kids and Offers—are available from the home edit and desktop navigation, while account, wishlist and cart controls remain available in the compact mobile header.

## Next implementation boundary

Payment and shipping production rules come next: payment-provider handoff/webhooks, successful-payment capture, failure/cancellation release of reserved inventory, shipping methods/rates, order status transitions and customer order history. The admin phase will then operate products, variants, stock, offers and orders through the same domain boundaries.
