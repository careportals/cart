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

### Or call it from JavaScript

If your site renders products with a framework, skip the `data-` attributes and
call the cart directly. These are installed on `window` once the cart mounts:

```js
// one product
window.cpAddItemToCart(productId, quantity = 1, shouldOpenCart = true);

// several at once
window.cpAddItemsToCart(
  [{ productId: 'abc123', variantId: '42', quantity: 2 }],
  true // open the drawer afterwards
);
```

The cart mounts asynchronously, so guard against calling too early — it sets
`window.cpAddToCartListenerAttached = true` when ready:

```js
if (window.cpAddToCartListenerAttached) {
  window.cpAddItemToCart('abc123');
}
```

### Analytics

The cart pushes GA4-shaped ecommerce events to `window.dataLayer` (creating it
if absent), so Google Tag Manager picks them up with no extra wiring:

```js
window.dataLayer.push({
  event: 'add_to_cart', // the cart event name
  ecommerce: {
    items: [
      {
        item_id: '6a29bdba229a0798f840f830',
        item_name: 'Product label',
        item_variant: 'variant id',
        price: 50,
        quantity: 1,
        discount: undefined
      }
    ]
  }
});
```

Listen for these in GTM, or read `window.dataLayer` directly.

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

## Building your product pages

The cart handles the drawer and checkout. You build the product pages it adds
from. Fetch your catalog from the same public API — no key, no auth, just the
`organization` header:

```js
const res = await fetch('https://public-api.portals.care/v2/products', {
  headers: { organization: 'your-organization-id', Accept: 'application/json' }
});
const products = await res.json(); // an array
```

The fields you need to render a card and wire a button:

| Field | Notes |
| --- | --- |
| `_id` | **This is the `data-product-id` value.** |
| `label` / `subLabel` | Title and secondary line |
| `description` | May be `null` |
| `price` / `listPrice` | Show `listPrice` struck through when it exceeds `price` |
| `currency` | e.g. `USD` |
| `images` | Array; may be empty, so keep a placeholder |
| `status` | Render only `active` |
| `type` | `physical` or `digital` |
| `isSubscription` | Worth badging |
| `options` | Variant choices — see below |
| `categories` | For filtering or grouping |

Putting it together — the button only needs the product id:

```js
container.innerHTML = products
  .filter(p => p.status === 'active')
  .map(
    p => `
      <div class="product-card">
        <h3>${p.label}</h3>
        <p>${p.currency} ${p.price}</p>
        <button class="add-to-cart-btn" data-product-id="${p._id}">
          Add to cart
        </button>
      </div>`
  )
  .join('');
```

Because the cart listens on `document`, markup injected like this works with no
re-initialization.

### Variants

A product with variants carries an `options` array. The cart renders the
selector inside the drawer itself, so you do not have to build one — adding by
`_id` is enough, and the shopper picks afterwards.

```json
[{ "type": "Color", "choices": [
  { "label": "Red",  "value": "red",  "default": true  },
  { "label": "Blue", "value": "blue", "default": false }
]}]
```

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

## Public API reference

Everything the cart does goes through the public API at
`https://public-api.portals.care/v2`. Every request carries your organization
id in an `organization` header. There is no API key and no auth — these are
public catalog and cart endpoints.

The cart calls the `/carts` endpoints for you. You only need `/products`, to
build your own product pages.

| Endpoint | Used by | Purpose |
| --- | --- | --- |
| `GET /products` | **you** | Catalog for your product pages |
| `POST /carts` | cart | Create a cart |
| `GET /carts/{id}` | cart | Read a cart |
| `POST /carts/{id}/items` | cart | Add items |
| `PUT /carts/{id}/items/{itemId}` | cart | Change quantity or options |
| `DELETE /carts/{id}/items/{itemId}` | cart | Remove an item |
| `GET /carts/{id}/related` | cart | Related-product upsells |
| `GET /carts/checkout-url` | cart | Resolve the checkout destination |
| `GET /carts/theme` | cart | Font and primary colour overrides |

The cart persists the active cart id in `localStorage` under `cart-id`, so a
returning visitor keeps their cart.

Response types are declared in
[`src/app/api-types.ts`](src/app/api-types.ts). They are a consumer-side view,
narrowed to the fields this widget reads — the API is the source of truth, not
that file.

A `/v1` catalog also exists and is auto-detected from the URL suffix, then
normalized to the v2 shape. New integrations should use `/v2`.

---

## Contributing

Issues and pull requests are welcome. Changes must keep both API versions
working. This repository is maintained upstream and mirrored here, so merged
changes are applied upstream and return in a later sync rather than as your
original commit.

## License

MIT — see [LICENSE](LICENSE).
