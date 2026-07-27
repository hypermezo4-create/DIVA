# Production operations

This checklist covers the runtime requirements that must be true before DIVA is treated as launch-ready.

## Required environment

```text
NEXT_PUBLIC_SITE_URL=https://store.example.com
DATABASE_URL=postgresql://...
BETTER_AUTH_URL=https://store.example.com
BETTER_AUTH_SECRET=<strong random secret, at least 32 characters>
```

`NEXT_PUBLIC_SITE_URL` and `BETTER_AUTH_URL` should use the final HTTPS origin. Do not point production authentication at a preview deployment URL.

## Database release order

1. Take or confirm a recoverable PostgreSQL backup.
2. Deploy application code that remains compatible with the current schema when possible.
3. Run `npm run db:migrate` once against the production database.
4. Run `npm run db:seed` only when the release intentionally updates baseline merchandising or shipping configuration.
5. Verify `/api/health` returns HTTP 200 with `status=ok` and `database=ok`.

Migrations are tracked by name and checksum. Never edit a SQL migration that has already been applied to production; add a new migration instead.

## Release verification

Run before promoting a build:

```bash
npm install --no-audit --no-fund
npm run db:migrate
npm run db:seed
npm run test:smoke
npm run lint
npm run typecheck
npm run build
```

The repository does not currently contain a package lockfile, so CI and release verification use `npm install`. Once a lockfile is generated and committed, switch both flows to the matching clean-install command in the same change.

After starting the production build against the release database:

```bash
npm start
npm run test:runtime
```

The runtime smoke check verifies database readiness, production security headers, canonical and language metadata, home/product structured data, private-route indexing policy, robots/sitemap output and cross-site mutation rejection.

## Security expectations

- HTTPS only in production; HSTS is emitted by the production Next.js configuration.
- Admin role changes happen only through a trusted environment with database access.
- Admin, checkout, order cancellation, cart and wishlist mutations require same-origin browser signals in addition to their normal session/token authorization.
- Account, cart, checkout, wishlist, order and admin route trees are excluded from indexing.
- Secrets never belong in `NEXT_PUBLIC_*` variables, browser bundles, source control or analytics payloads.
- Payment webhook endpoints must verify the selected provider signature before calling payment settlement services.
- Refund operations must be implemented through the provider/refund boundary before admins can reverse paid orders.

## Monitoring

At minimum monitor:

- `/api/health` availability and latency;
- HTTP 5xx rate;
- checkout/order creation failures;
- payment webhook verification failures once a provider is connected;
- PostgreSQL connection saturation and slow queries;
- inventory reservation failures;
- production deployment/build failures.

Health checks should alert on repeated 503 responses. The health response intentionally contains no credentials, customer data or internal database details.

## Backup and recovery

Production PostgreSQL needs scheduled backups and a tested restore path. A restore drill should confirm that products, variants, inventory reservations, customers, orders, payment attempts, shipping configuration and editorial overrides are all recovered together.

## Launch blockers still outside this baseline

The storefront should not accept real-money production orders until these are connected and validated:

- the selected payment provider handoff and signed webhook flow;
- refund handling;
- destination-aware production shipping prices/rules;
- production database and auth secrets;
- browser E2E coverage for purchase and admin critical paths;
- accessibility and performance measurements on the deployed origin.
