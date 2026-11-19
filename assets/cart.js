/**
 * cart.js — AJAX cart + cart drawer.
 * Uses the Cart AJAX API with bundled Section Rendering (sections=cart-drawer) so the drawer
 * HTML always comes from Liquid (one source of truth, no client-side templates).
 */
(() => {
  const L = window.Lastly;
  const SECTION = 'cart-drawer';

  const drawer = () => document.getElementById('CartDrawer');

  /** Replace drawer contents + header counts from a sections payload. */
  function renderSections(sections) {
    if (!sections || !sections[SECTION]) return;
    const doc = new DOMParser().parseFromString(sections[SECTION], 'text/html');
    const fresh = doc.querySelector('[data-cart-drawer-inner]');
    const current = document.querySelector('[data-cart-drawer-inner]');
    if (fresh && current) current.replaceWith(fresh);
    const count = doc.querySelector('[data-cart-count-source]');
    if (count) {
      const n = Number(count.dataset.count || 0);
      document.querySelectorAll('[data-cart-count]').forEach((el) => {
        el.textContent = n;
        el.hidden = n === 0;
      });
      document.querySelectorAll('[data-cart-label]').forEach((el) => el.setAttribute('aria-label', count.dataset.label));
    }
    document.dispatchEvent(new CustomEvent('cart:updated'));
  }

  async function refresh() {
    const res = await fetch(`${L.routes.root}?sections=${SECTION}`.replace('//?', '/?'));
    renderSections(await res.json());
  }

  async function add(items, { open = true, source } = {}) {
    source?.classList.add('is-loading');
    source?.setAttribute('aria-disabled', 'true');
    try {
      const data = await L.fetchJSON(L.routes.cartAdd, {
        method: 'POST',
        body: JSON.stringify({ items, sections: SECTION, sections_url: window.location.pathname }),
      });
      renderSections(data.sections);
      const added = data.items || [];
      window.LastlyTrack?.('add_to_cart', {
        currency: L.currency,
        value: added.reduce((s, i) => s + (i.final_line_price || i.final_price * i.quantity), 0) / 100,
        items: added.map((i) => ({ item_id: String(i.variant_id), item_name: i.product_title, item_variant: i.variant_title, price: i.final_price / 100, quantity: i.quantity })),
      });
      if (open && drawer()) drawer().open(source);
      else L.toast(drawer()?.dataset.addedLabel || 'Added to cart');
      return data;
    } catch (err) {
      L.toast(err.message || L.strings.cartError, 4000);
      throw err;
    } finally {
      source?.classList.remove('is-loading');
      source?.removeAttribute('aria-disabled');
    }
  }

  async function change(line, quantity) {
    const inner = document.querySelector('[data-cart-drawer-inner]');
    inner?.setAttribute('aria-busy', 'true');
    try {
      const data = await L.fetchJSON(L.routes.cartChange, {
        method: 'POST',
        body: JSON.stringify({ line, quantity, sections: SECTION, sections_url: window.location.pathname }),
      });
      renderSections(data.sections);
    } catch (err) {
      L.toast(err.message || L.strings.cartError, 4000);
      await refresh();
    } finally {
      document.querySelector('[data-cart-drawer-inner]')?.removeAttribute('aria-busy');
    }
  }

  L.cart = { add, change, refresh };

  /* ---------- <product-form>: any form[action$="/cart/add"] wrapped in it goes AJAX ---------- */
  class ProductForm extends HTMLElement {
    connectedCallback() {
      this.form = this.querySelector('form');
      if (!this.form) return;
      this.form.addEventListener('submit', (e) => this.onSubmit(e));
    }
    async onSubmit(e) {
      if (!drawer()) return; // fall back to native POST → /cart
      e.preventDefault();
      const btn = e.submitter || this.form.querySelector('[type="submit"]');
      if (btn?.getAttribute('aria-disabled') === 'true' || btn?.disabled) return;
      const fd = new FormData(this.form);
      const items = [{ id: Number(fd.get('id')), quantity: Number(fd.get('quantity') || 1) }];
      // Optional extra items (e.g. "Frequently bought together").
      this.form.querySelectorAll('[data-extra-variant]:checked, input[type="hidden"][data-extra-variant]').forEach((el) => {
        items.push({ id: Number(el.value), quantity: 1 });
      });
      try { await add(items, { source: btn }); } catch (err) { /* toast shown */ }
    }
  }
  customElements.define('product-form', ProductForm);

  /* ---------- Delegated cart-drawer interactions ---------- */
  document.addEventListener('change', (e) => {
    const input = e.target.closest('[data-cart-line-qty]');
    if (!input) return;
    change(Number(input.dataset.line), Math.max(0, Number(input.value)));
  });

  document.addEventListener('click', (e) => {
    const remove = e.target.closest('[data-cart-remove]');
    if (remove) {
      e.preventDefault();
      change(Number(remove.dataset.line), 0);
      return;
    }
    const quick = e.target.closest('[data-quick-add]');
    if (quick && drawer()) {
      e.preventDefault();
      add([{ id: Number(quick.dataset.quickAdd), quantity: 1 }], { source: quick }).catch(() => {});
    }
  });

  // Keep the drawer fresh when the page is restored from bfcache (back button).
  window.addEventListener('pageshow', (e) => { if (e.persisted) refresh(); });

  // Cart page (/cart) quantity inputs submit the native form on change.
  document.addEventListener('change', (e) => {
    const input = e.target.closest('[data-cart-page-qty]');
    if (input) input.form.requestSubmit(input.form.querySelector('[name="update"]'));
  });
})();
