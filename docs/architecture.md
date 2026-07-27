# Architecture

DIVA is one Next.js full-stack application with strong internal boundaries. A separate API service is not introduced until another client or scaling requirement makes it useful.

```text
src/
├── app/          routes, layouts and server entry points
├── components/   reusable UI and layout primitives
├── i18n/         locale routing and request configuration
└── features/     commerce domains
```

Current and planned commerce domains:

```text
features/
├── catalog/      implemented
├── cart/         planned
├── checkout/     planned
├── inventory/    planned
├── orders/       planned
├── customers/    planned
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

## Catalog boundary

The catalog currently owns the product browsing contract: product identity, audience, footwear family, localized copy, imagery, available size presentation, colorways and collection membership. Routes consume catalog query functions rather than importing product records directly into page logic.

The current catalog source is repository-backed so the storefront can establish its UX and domain contract before persistence is added. It does not claim live inventory or checkout availability.

## Internationalization

Locale URLs are explicit: `/ar`, `/en`, `/de` and `/ru`. Arabic switches the root document to RTL. Interface copy lives in locale messages, while the current catalog source owns localized product copy. When persistence is introduced, localized product content moves behind the catalog data-access boundary without changing route contracts.

## Themes

The visual system is derived from the supplied DIVA mark: warm ivory, espresso, champagne gold and bronze. Dark mode uses deep espresso surfaces rather than neutral black so the brand remains visually consistent.

## Next implementation boundary

The next phase introduces the commerce backend: PostgreSQL persistence, product variants, inventory and authentication. Database access must remain behind feature-level data access so page components do not depend on the persistence implementation.
