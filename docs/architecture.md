# Architecture

DIVA starts as one Next.js full-stack application with strong internal boundaries. A separate API service is not introduced until another client or scaling requirement makes it useful.

```text
src/
├── app/          routes, layouts and server entry points
├── components/   reusable UI and layout primitives
├── i18n/         locale routing and request configuration
└── features/     commerce domains as they are implemented
```

Planned commerce domains:

```text
features/
├── catalog/
├── cart/
├── checkout/
├── inventory/
├── orders/
├── customers/
└── admin/
```

The intended dependency direction is:

```text
Routes / UI
    ↓
Feature use-cases
    ↓
Data access
    ↓
PostgreSQL and external providers
```

## Internationalization

Locale URLs are explicit: `/ar`, `/en`, `/de` and `/ru`. Arabic switches the root document to RTL. Translation files currently contain brand-shell copy; product content will use localized persistence once the catalog schema is implemented.

## Themes

The visual system is derived from the supplied DIVA mark: warm ivory, espresso, champagne gold and bronze. Dark mode uses deep espresso surfaces rather than neutral black so the brand remains visually consistent.

## Next implementation boundary

The next feature phase introduces the catalog domain: product, variant, size, color, inventory and localized product content. Database and validation dependencies should be selected at that point, against the concrete schema and deployment target.
