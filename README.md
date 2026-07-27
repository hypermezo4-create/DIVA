# DIVA

DIVA is a multilingual luxury-footwear storefront being built from scratch around the **DIVA Premium Mirror** identity.

## Foundation

- Next.js 16 App Router + React 19 + TypeScript
- Tailwind CSS 4 design tokens and responsive layout
- `next-intl` locale routing for Arabic, English, German and Russian
- True RTL document direction for Arabic
- Light, dark and system themes with `next-themes`
- Motion-based hero transitions with reduced-motion support
- Feature-oriented commerce boundaries documented before domain implementation

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

## Project direction

The current foundation intentionally covers the public brand shell and internationalization layer. Product data, authentication, PostgreSQL schema, checkout, payments and admin workflows are separate implementation phases so the project does not ship speculative infrastructure before those contracts are defined.

See [`docs/architecture.md`](docs/architecture.md) for the planned boundaries.
