# CarePortals Cart

An embeddable shopping cart widget. Add two script tags and some `data-`
attributes to your existing product pages and you get a cart drawer backed by
the [CarePortals](https://portals.care) public API — line items, quantity and
option editing, related-product upsells, and a handoff to checkout.

No framework required on your side. It attaches to plain HTML.

Built with React, [Mantine](https://mantine.dev) and [Jotai](https://jotai.org).

---

## Quick start

### 1. Configure and load

```html
<script>
  window.organization = 'your-organization-id';
  window.carePortalsCheckoutUrl = 'https://your-org.portals.care/checkout/v2';
</script>
<script src="https://your-cdn.example.com/cart/scripts.js" async></script>
```

`scripts.js` is a small loader emitted by the build; it injects the hashed JS
and CSS bundles.

### 2. Add the mount point

The cart renders into this element. Put it anywhere — it is a drawer, so
position does not matter.

```html
<div id="portals-cart-app"></div>
```

### 3. Add buttons

The cart listens for clicks on `document`, so buttons added later (by a
framework, a template loop, or another script) work without re-initializing.

**Add to cart** — give the element the class `add-to-cart-btn` (or
`product-item`) and describe the product with `data-` attributes:

```html
<button
  class="add-to-cart-btn"
  data-product-id="abc123"
  data-variant-id="42"
  data-quantity="1"
>
  Add to cart
</button>
```

For several products at once, pass a JSON array instead:

```html
<button
  class="add-to-cart-btn"
  data-products='[{"productId":"abc123","variantId":"42","quantity":1}]'
>
  Add bundle
</button>
```

**Open the cart** — any element with the class `open-cart`:

```html
<button class="open-cart">Cart</button>
```

### Gotchas

- **An inline `onclick` wins.** If the element has its own `onclick`, the cart
  ignores the click and lets your handler run. Use one or the other.
- **The click target is the element itself**, not its children. An icon inside
  the button will not trigger it — put the class on whatever is actually
  clicked, or make the child `pointer-events: none`.
- `data-product_id` / `data-variant_id` (snake_case) are accepted as aliases.
- Missing `data-product-id` and `data-products` means the click is a no-op.

---

## Configuration

Read off `window` at runtime, so a page can change it without a rebuild.

| Key | Required | Purpose |
| --- | --- | --- |
| `organization` | yes | Sent as the `organization` request header. `cart_organization` is an alias. |
| `carePortalsCheckoutUrl` | no | Checkout destination. `:cartId` is replaced with the cart id. `portalsCheckoutUrl` is an alias. |
| `carePortalsCheckoutQuery` | no | Query string merged into the checkout URL (e.g. attribution params). |

The cart throws `organization is not defined in window` if the organization is
missing — set it *before* the loader script runs.

The API base URL is build-time, in [`src/environments/`](src/environments).
`npm run build` targets production; `npm run build:dev` targets a local API on
port 3304. Point the built assets at your own origin with `CART_CDN_BASE`:

```bash
CART_CDN_BASE=https://your-cdn.example.com/cart/ npm run build
```

A WordPress plugin wrapper lives in [`wp-plugin/`](wp-plugin/cart.php).

---

## Building with an AI assistant

This repo is written to be read by coding agents as well as people.
[`AGENTS.md`](AGENTS.md) holds the build commands, the embed contract above in
condensed form, and the constraints that are easy to get wrong. Most agents
(Claude Code, Cursor, Codex, and others) pick it up automatically once the repo
is cloned.

To integrate the cart into *your* site, point your assistant at this README —
the embed contract above is complete and copy-pasteable. To work on the cart
itself:

```bash
git clone https://github.com/careportals/cart.git
cd cart
npm install
npm run dev
```

---

## Develop

```bash
npm install
npm run dev
```

[`index.html`](index.html) is a standalone harness: it lists products from a
local CarePortals API and wires up real add-to-cart buttons. Pass
`?organization=<id>` to switch tenants and `?checkoutUrl=<url>` to point
checkout elsewhere.

```bash
npx tsc --noEmit   # typecheck; should be clean
npm run build      # production bundle + scripts.js loader
```

---

## API surface

The cart speaks two versions of the carts API and picks one by inspecting the
configured URL suffix (`/v1` or `/v2`); v1 responses are normalized to the v2
shape in [`src/app/utils`](src/app/utils/index.ts).

`getCart`, `createCart`, `addItemToCart`, `removeItemFromCart`,
`updateItemInCart`, `getCartRelatedProducts`, `getCartCheckoutUrl`,
`getCartTheme`.

Response types are declared locally in
[`src/app/api-types.ts`](src/app/api-types.ts). They are a consumer-side view of
the API, narrowed to the fields this widget reads — the API is the source of
truth, not this file.

---

## Contributing

Issues and pull requests are welcome. Changes must keep both API versions
working. Note that this repository is published from an internal monorepo, so
merged changes are applied upstream and land back here in a later sync rather
than as your original commit.

## License

MIT — see [LICENSE](LICENSE).
