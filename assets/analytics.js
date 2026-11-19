/**
 * analytics.js — tracking-ready, pixel-safe.
 *
 * - Shopify's standard Web Pixel events (product_viewed, product_added_to_cart, checkout_started …)
 *   already fire automatically for Online Store themes; we never block or replace them.
 * - We ADD GA4-named events (view_item, add_to_cart, begin_checkout) to:
 *     1. window.dataLayer (GTM / GA4)
 *     2. Shopify Customer Events as custom events "lastly:<name>" via Shopify.analytics.publish,
 *        so a Custom Pixel in Settings → Customer events can subscribe to them.
 * - Clicks on any element with [data-track="name"] emit "cta_click" with that name.
 */
(() => {
  window.dataLayer = window.dataLayer || [];

  function track(name, payload = {}) {
    try {
      window.dataLayer.push({ ecommerce: null });
      window.dataLayer.push({ event: name, ecommerce: payload });
    } catch (e) { /* never throw from tracking */ }
    try {
      if (window.Shopify && window.Shopify.analytics && typeof window.Shopify.analytics.publish === 'function') {
        window.Shopify.analytics.publish(`lastly:${name}`, payload);
      }
    } catch (e) { /* noop */ }
  }
  window.LastlyTrack = track;

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-track]');
    if (!el) return;
    track('cta_click', { cta: el.dataset.track, text: (el.textContent || '').trim().slice(0, 80), page: location.pathname });
  });

  // Capture UTM params once per session into cart attributes-friendly storage.
  try {
    const params = new URLSearchParams(location.search);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].forEach((k) => {
      if (params.get(k)) sessionStorage.setItem(k, params.get(k));
    });
  } catch (e) { /* noop */ }
})();
