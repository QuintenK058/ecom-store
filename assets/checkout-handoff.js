/**
 * checkout-handoff.js — THE ONLY place that knows how checkout starts.
 *
 * Switch providers in Theme settings → Checkout (no code changes):
 *   - "shopify": standard Shopify checkout (/checkout). Default.
 *   - "whop":    Whop via Lasso. Redirects to the configured Whop/Lasso URL with the
 *                cart lines encoded as query params.
 *
 * Contract used by the rest of the theme:
 *   window.LastlyCheckout.begin(sourceElement?)  -> Promise<void>
 *   Any <form> or <button> with [data-checkout] is wired automatically.
 *
 * To add a provider, add a function to `providers` — nothing else in the theme changes.
 */
(() => {
  const L = window.Lastly || {};

  const getCart = () => fetch(`${L.routes.root}cart.js`.replace('//', '/'), { headers: { Accept: 'application/json' } }).then((r) => r.json());

  const providers = {
    async shopify() {
      // Shopify checkout handles discounts, Shop Pay, Apple Pay, Google Pay and BNPL.
      window.location.href = `${L.routes.root}checkout`.replace('//', '/');
    },

    async whop(cart) {
      const base = L.checkout && L.checkout.whopUrl;
      if (!base) {
        console.warn('[checkout-handoff] Whop provider selected but no Whop/Lasso URL set. Falling back to Shopify checkout.');
        return providers.shopify(cart);
      }
      // ASSUMPTION: Lasso accepts line items as `items=<variantId>:<qty>,...` plus currency.
      // Confirm the exact parameter contract with Whop/Lasso before enabling (see docs/decisions.md).
      const url = new URL(base);
      url.searchParams.set('items', cart.items.map((i) => `${i.variant_id}:${i.quantity}`).join(','));
      url.searchParams.set('currency', cart.currency);
      url.searchParams.set('cart_token', cart.token);
      if (cart.attributes && cart.attributes.utm_source) url.searchParams.set('utm_source', cart.attributes.utm_source);
      window.location.href = url.toString();
    },
  };

  let busy = false;
  async function begin(source) {
    if (busy) return;
    busy = true;
    source?.classList?.add('is-loading');
    try {
      const cart = await getCart();
      if (!cart.item_count) { window.location.href = L.routes.cart; return; }
      window.LastlyTrack?.('begin_checkout', {
        currency: cart.currency,
        value: cart.total_price / 100,
        items: cart.items.map((i) => ({ item_id: String(i.variant_id), item_name: i.product_title, item_variant: i.variant_title, price: i.final_price / 100, quantity: i.quantity })),
      });
      const provider = providers[(L.checkout && L.checkout.provider) || 'shopify'] || providers.shopify;
      await provider(cart);
    } catch (err) {
      console.error('[checkout-handoff]', err);
      // Safe fallback: the native cart form still posts to Shopify checkout.
      window.location.href = `${L.routes.root}checkout`.replace('//', '/');
    } finally {
      // If navigation didn't happen (e.g. blocked), restore the button.
      setTimeout(() => { busy = false; source?.classList?.remove('is-loading'); }, 4000);
    }
  }

  document.addEventListener('submit', (e) => {
    const form = e.target.closest('form[data-checkout]');
    if (!form) return;
    // Only intercept the checkout submitter, not "update" buttons.
    if (e.submitter && e.submitter.name && e.submitter.name !== 'checkout') return;
    e.preventDefault();
    begin(e.submitter || form.querySelector('[name="checkout"]'));
  });

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-checkout]:not([type="submit"]), a[data-checkout]');
    if (!btn) return;
    e.preventDefault();
    begin(btn);
  });

  window.LastlyCheckout = { begin, providers };
})();
