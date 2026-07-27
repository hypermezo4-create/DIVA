# DIVA engineering rules

- Keep the application feature-oriented. Shared UI belongs in `src/components`; domain behavior belongs in `src/features` when that domain is introduced.
- Validate untrusted input at server boundaries. Do not add defensive checks inside typed internal contracts without a real boundary.
- Do not access the future database directly from page components. Pages call domain queries/use-cases; the data layer owns persistence.
- Do not hardcode customer-facing copy in components when it belongs in locale messages.
- Arabic layouts must remain RTL-safe. Prefer logical CSS properties (`inline`, `start`, `end`) over physical left/right positioning.
- New motion must respect `prefers-reduced-motion` or Motion's `useReducedMotion`.
- Avoid speculative dependencies, abstractions and feature flags. Add infrastructure when a concrete feature needs it.
- Run lint, typecheck and build before merging production changes.
