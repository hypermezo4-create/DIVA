# Architecture

DIVA is one Next.js full-stack application with strong internal boundaries. A separate API service is not introduced until another client or scaling requirement makes it useful.

```text
src/
├── app/          routes, layouts and server entry points
├── components/   reusable UI, layout and commerce interaction primitives
├── db/           PostgreSQL client and Drizzle schema
├── i18n/         locale routing and request configuration
├── lib/          cross-cutting server integrations such as auth, SEO and request security
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
├── content/              whitelisted multilingual storefront overrides
└── admin/                role-gated reporting and operational mutations
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

Editorial persistence uses `site_content` with a composite `(key, locale)` identity, the editing admin user and an update timestamp. Only whitelisted storefront content keys can be written through the admin API. Source message files remain the fallback, so an empty override table does not replace the versioned translation baseline.

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

## Admin operations boundary

Admin access is a server-owned role. Public sign-up cannot submit or elevate the role field. An existing account can be promoted or demoted only from a trusted environment with database access through `npm run admin:role -- <email> <admin|customer>`.

The localized `/[locale]/admin` route tree checks the current session before rendering and returns no admin workspace to non-admin accounts. Mutation APIs under `/api/admin/*` repeat the same authorization check; the browser UI is not treated as an authorization boundary.

The admin reporting repository exposes currency-safe dashboard metrics, product publication state, SKU stock/pricing, order queues and customer activity. Revenue is grouped by currency rather than summing unlike currencies.

Operational mutations cover:

- product `draft` / `active` / `archived` state and new-arrival flags;
- variant active state, selling price and compare-at offer price;
- `onHand` inventory updates only when the new stock level remains at or above existing reservations;
- pending-payment cancellation through the same inventory-release lifecycle used by customer cancellation;
- forward-only paid-order fulfilment transitions: `confirmed → processing → shipped → delivered`;
- whitelisted home/footer copy overrides independently for Arabic, English, German and Russian.

The editorial desk displays the source-message value when no database override exists. Storefront home/footer reads merge those overrides at request time, and successful edits revalidate the localized route tree. The public storefront also falls back safely to file copy when the content migration has not yet been applied.

Admin order operations deliberately do not reverse paid fulfilment states or perform refunds. Those actions require the production payment/refund boundary so stock and money cannot drift apart.

## Production hardening boundary

Global response headers disable framing, MIME sniffing, unnecessary browser capabilities and cross-origin resource sharing by default. Production responses add HSTS and a restrictive Content Security Policy that keeps application scripts, forms and connections same-origin while allowing the current catalog image source. API responses are also marked `no-store` and `noindex`.

State-changing checkout, order-cancellation, account cart/wishlist and admin APIs reject browser requests whose Fetch Metadata or `Origin` signals indicate a cross-site mutation. Authentication and authorization remain separate checks; the origin guard reduces CSRF exposure but does not replace session ownership or admin-role validation.

Private route trees for account, cart, wishlist, checkout, order confirmation and admin declare `noindex`. Public home, shop and product pages expose canonical, `x-default` and language-alternate metadata; home and product surfaces publish JSON-LD. `robots.txt` defines the private crawl boundary and the sitemap includes localized home, shop and active product URLs.

`/api/health` performs a live database readiness check and disables caching. CI provisions PostgreSQL, installs the declared dependencies, migrates/seeds the database, runs commerce smoke tests, lint, typecheck and production build, then boots the built server and verifies health, security headers, public/private SEO behavior, RTL output, product indexing and cross-site mutation rejection.

Keyboard focus indicators, high-contrast affordances and a localized skip-to-content control are global, while the existing reduced-motion rules remain the motion accessibility baseline. Localized 404 and route-error pages provide recovery actions without exposing server error details.

Repeated storefront-content reads and product-detail reads within one server render are deduplicated with React request caching so metadata and page composition do not repeat the same database work.

## Catalog and customer-commerce boundaries

`/[locale]/shop` and `/[locale]/product/[slug]` read active products from PostgreSQL. The primary customer-facing taxonomy is Women, Men, Kids and Offers. Catalog queries expose localized copy, imagery, active/compare-at prices and inventory availability while keeping route components independent from Drizzle.

`CommerceProvider` owns browser interaction state. Signed-in customers use database-backed cart/wishlist endpoints. Guests keep only variant quantities and product IDs in local storage, then call public quote endpoints to hydrate that identity-only state with current server-authoritative copy, price and availability. Checkout performs its own final validation instead of trusting cart totals.

## Internationalization and presentation

Locale URLs are explicit: `/ar`, `/en`, `/de` and `/ru`. Arabic switches the root document to RTL. Interface copy lives in locale messages. Persistent product, color, collection and shipping copy is stored by locale, while selected marketing copy can be overridden in `site_content` without modifying source files.

The visual system is derived from the supplied DIVA mark: warm ivory, espresso, champagne gold and bronze. Dark mode uses deep espresso surfaces rather than neutral black. Women, Men, Kids and Offers remain the four primary storefront pillars. The admin workspace uses the same design tokens rather than a separate generic dashboard theme.

## Next implementation boundary

The first production-hardening pass is in place. The remaining launch-critical commerce work is the selected payment gateway handoff/webhook/refund integration plus destination-aware production shipping rules. The remaining hardening work is deeper browser E2E coverage, measured accessibility/performance, observability and verified deployment/runtime environment configuration.
