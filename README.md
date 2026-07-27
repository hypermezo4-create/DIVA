# DIVA

DIVA is a multilingual luxury-footwear storefront being built from scratch around the **DIVA Premium Mirror** identity.

## Current stack

- Next.js 16 App Router + React 19 + TypeScript
- Tailwind CSS 4 design tokens and responsive layout
- `next-intl` locale routing for Arabic, English, German and Russian
- True RTL document direction for Arabic
- Light, dark and system themes with `next-themes`
- Motion-based hero transitions with reduced-motion support
- Feature-oriented catalog domain with localized product copy

## Implemented surfaces

- Luxury home page and global brand shell
- `/ar`, `/en`, `/de` and `/ru` locale routes
- Filterable `/[locale]/shop` catalog
- Localized `/[locale]/product/[slug]` detail pages
- Audience, new-arrival and collection filtering
- Product sizes, colorways and collection presentation

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Locale routing redirects to a supported locale such as `/en`.

## Quality checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Delivery roadmap

1. Foundation and design system — complete
2. Catalog and product experience — current phase
3. Commerce backend — PostgreSQL persistence, variants, inventory and authentication
4. Customer commerce — cart, wishlist, checkout, orders, payments and shipping
5. Admin operations — products, stock, orders, customers, content and translations
6. Production hardening — tests, accessibility, security, SEO, performance and deployment

See [`docs/architecture.md`](docs/architecture.md) for the current boundaries.
