# AGENTS.md

Embeddable shopping cart widget (React + Mantine + Jotai, built with Vite) that
mounts into a host page and talks to the CarePortals public API.

## Commands

```bash
npm install        # lockfile is committed; prefer npm ci for reproducibility
npm run dev        # Vite dev server + the harness in index.html
npm run build      # production bundle -> dist/, plus the scripts.js loader
npm run build:dev  # same, pointed at a local API on port 3304
npm run lint       # ESLint flat config; must exit 0
npx tsc --noEmit   # typecheck; currently clean, keep it that way
```

**There are no tests.** `npm test` runs vitest with `passWithNoTests`, so it
exits 0 having verified nothing — do not cite it as proof a change works.
Verify with `npm run lint`, `npx tsc --noEmit`, `npm run build`, and the
harness.

`npm run lint` reports a handful of `react-hooks/exhaustive-deps` **warnings**
in `app.tsx` and `cart-item.tsx`. They are known and deliberate: those effects
key off `[cart]` only, and satisfying the rule would change when they re-run.
Leave them alone unless you are actually reworking that logic.

## Architecture

- `src/main.tsx` — mounts into `#portals-cart-app` on the host page.
- `src/app/app.tsx` — delegated `click` listener on `document` (this is the
  whole public integration surface), plus the drawer and checkout redirect.
- `src/app/use-cart.ts` — all cart state, in a Jotai atom. Most logic lives here.
- `src/app/cart-api.ts` — axios client. Reads `window.organization` on *every*
  request, because the host page may set it late.
- `src/app/utils/index.ts` — v1 to v2 normalization.
- `src/app/api-types.ts` — see below.

## Constraints that are easy to get wrong

**`src/app/api-types.ts` is deliberately partial.** It is a hand-narrowed,
consumer-side view of the API, containing only the fields this widget reads.
It is not generated and there is no schema in this repo to check it against.
Do not "complete" it, infer missing fields, or reshape it to look like a server
model. Add a field only when the widget actually starts reading it.

**Both API versions must keep working.** The version is inferred from the
configured URL suffix (`/v1` or `/v2`) in `getVersion()`. v1 is
BigCommerce-shaped and normalized into the v2 shape. A change to cart or line
item handling has to work on both paths.

**The integration contract is load-bearing and unversioned.** Host pages in the
wild depend on these exact names; renaming any of them is a breaking change:

- mount point: `#portals-cart-app`
- add to cart: class `add-to-cart-btn` or `product-item`, with
  `data-product-id` + `data-variant-id` + `data-quantity`, or `data-products`
  holding a JSON array
- open drawer: class `open-cart`
- config: `window.organization`, `window.carePortalsCheckoutUrl`,
  `window.carePortalsCheckoutQuery` (aliases: `cart_organization`,
  `portalsCheckoutUrl`)
- programmatic API installed on `window`: `cpAddItemToCart`,
  `cpAddItemsToCart`, and the `cpAddToCartListenerAttached` readiness flag
- analytics: GA4 ecommerce events pushed to `window.dataLayer`
- an element with its own inline `onclick` is skipped on purpose

See [readme.md](readme.md) for the full contract with examples.

**Asset origin is build-time.** `CART_CDN_BASE` is baked into the generated
`scripts.js` loader. It defaults to relative paths.

## This repo is a mirror

It is maintained upstream and mirrored here as a single squashed commit, so it
has no history before `init` and is force-pushed on each sync. Commits made
directly here are replaced by the next sync — changes have to land upstream.
Open a pull request; a maintainer applies it upstream and it returns in a later
sync.
