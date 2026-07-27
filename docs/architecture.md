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

Current commerce domains:

```text
features/
├── catalog/              live storefront + Women/Men/Kids/Offers queries
├── inventory/            variant inventory and reservation rules
├── customer-commerce/    cart + wishlist contracts and persistence
├── checkout/             final price/stock/shipping validation + order transaction
├── shipping/             active localized shipping-method queries
├── payments/             payment attempts + provider adapter boundary
├── orders/               confirmation, history, ownership and lifecycle operations
├── customers/            Better Auth backend + localized account UI
└── admin/                next major product phase
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

Fulfilment persistence adds localized shipping methods with server-owned prices plus payment attempts with provider identity, idempotency key, provider reference, amount, currency, checkout URL and state. The order and payment models distinguish pending, paid, failed/cancelled and refunded states instead of encoding provider details into the order table.

Tracked SQL files in `drizzle/` are applied by `scripts/migrate.mjs`. The migration runner records migration names and checksums in PostgreSQL so an already-applied migration cannot be silently rewritten. Catalog and commerce seed scripts provide repeatable demo merchandising and shipping configuration for development and CI.

## Inventory and checkout

Inventory stores `onHand` and `reserved` separately. Cart operations read current availability but do not reserve stock, avoiding abandoned carts locking inventory.

Checkout treats cart content as purchase intent only. Inside one database transaction it reloads active variants, localized option data and current prices, validates one currency, validates the selected active shipping method and its current price, atomically increments `reserved` only when sufficient stock remains, creates the order/item snapshots and clears the signed-in cart. Any failure rolls the transaction back, including reservations made earlier in the same attempt.

When payment is confirmed, the order lifecycle converts reserved stock into sold stock by decrementing both `onHand` and `reserved`, then moves the order to `confirmed` and payment to `paid`. Cancelling an eligible pending-payment order releases reserved inventory and marks created/pending payment attempts and the order payment state as cancelled.

## Payment boundary

`features/payments` persists payment attempts and exposes a provider adapter contract. Provider-specific SDK calls, credential handling and webhook signature verification do not leak into checkout or order code. The final production gateway can create a handoff from an existing payment attempt, then call the settlement service only after a verified provider event.

A concrete production provider is intentionally not hard-coded before the provider/market decision is made. The database and lifecycle boundary are already in place for the integration.

## Shipping boundary

Shipping methods are database-backed and localized. Checkout retrieves the active methods for the cart currency through `/api/shipping`, presents them to the customer and sends only the selected method code back. The server then revalidates that method and price during order creation; the browser total is never authoritative.

The current seeded `standard` method preserves the existing zero-price development behavior. Production rates can be changed in data without rewriting checkout code, and richer destination/rate rules can be added behind the same boundary.

## Authentication, privacy and customer orders

Better Auth is mounted at `/api/auth/[...all]` and uses the same PostgreSQL connection through the Drizzle adapter. Email/password authentication is enabled and the application owns role/locale fields rather than accepting them from untrusted sign-up input.

Checkout supports guests and authenticated customers. Guest confirmation pages require both the public order number and a high-entropy confirmation token and are marked `noindex`. Signed-in customers get owned order history/detail routes under `/[locale]/account/orders`, which query by both user ID and order number.

Pending-payment cancellation accepts either authenticated ownership or the confirmation token, then delegates to the order lifecycle transaction so inventory release and state changes remain server-controlled.

## Catalog and customer-commerce boundaries

`/[locale]/shop` and `/[locale]/product/[slug]` read active products from PostgreSQL. The primary customer-facing taxonomy is Women, Men, Kids and Offers. Catalog queries expose localized copy, imagery, active/compare-at prices and inventory availability while keeping route components independent from Drizzle.

`CommerceProvider` owns browser interaction state. Signed-in customers use database-backed cart/wishlist endpoints. Guests keep only variant quantities and product IDs in local storage, then call public quote endpoints to hydrate that identity-only state with current server-authoritative copy, price and availability. Checkout performs its own final validation instead of trusting cart totals.

## Internationalization and presentation

Locale URLs are explicit: `/ar`, `/en`, `/de` and `/ru`. Arabic switches the root document to RTL. Interface copy lives in locale messages. Persistent product, color, collection and shipping copy is stored by locale.

The visual system is derived from the supplied DIVA mark: warm ivory, espresso, champagne gold and bronze. Dark mode uses deep espresso surfaces rather than neutral black. Women, Men, Kids and Offers remain the four primary storefront pillars.

## Next implementation boundary

The remaining provider-specific commerce work is the production payment handoff/webhook integration and final destination-aware shipping rules/rates. After that, the next major phase is the admin operations surface for products, variants, stock, offers, orders, customers, content and translations.
