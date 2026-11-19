/**
 * product.js — PDP: variant picker, gallery, offer tiers, sticky add-to-cart, recently viewed.
 */
(() => {
  const L = window.Lastly;

  /* ---------- <variant-picker> ---------- */
  class VariantPicker extends HTMLElement {
    connectedCallback() {
      this.section = this.closest('[data-product-section]');
      this.variants = JSON.parse(this.querySelector('[data-variants-json]').textContent);
      this.addEventListener('change', () => this.onChange());
      this.updateAvailability();
    }
    get selectedOptions() {
      return [...this.querySelectorAll('fieldset')].map((fs) => fs.querySelector('input:checked')?.value);
    }
    onChange() {
      const opts = this.selectedOptions;
      const variant = this.variants.find((v) => v.options.every((o, i) => o === opts[i]));
      this.updateAvailability();
      this.section.dispatchEvent(new CustomEvent('variant:change', { detail: { variant }, bubbles: true }));
      if (!variant) return;
      if (this.dataset.updateUrl !== 'false') {
        const url = new URL(window.location.href);
        url.searchParams.set('variant', variant.id);
        window.history.replaceState({}, '', url.toString());
      }
      this.querySelectorAll('[data-selected-value]').forEach((el, i) => { el.textContent = opts[i]; });
    }
    /** Mark option values that would produce a sold-out/non-existent combination. */
    updateAvailability() {
      const opts = this.selectedOptions;
      this.querySelectorAll('fieldset').forEach((fs, index) => {
        fs.querySelectorAll('input').forEach((input) => {
          const candidate = [...opts];
          candidate[index] = input.value;
          const match = this.variants.find((v) => v.options.every((o, i) => o === candidate[i]));
          const soldOut = !match || !match.available;
          input.classList.toggle('is-unavailable', soldOut);
          input.nextElementSibling?.setAttribute('data-sold-out', soldOut ? 'true' : 'false');
        });
      });
    }
  }
  customElements.define('variant-picker', VariantPicker);

  /* ---------- <product-info>: reacts to variant changes ---------- */
  class ProductInfo extends HTMLElement {
    connectedCallback() {
      this.addEventListener('variant:change', (e) => this.render(e.detail.variant));
      this.offer = this.querySelector('offer-tiers');
      const initial = this.querySelector('[name="id"]')?.value;
      const variants = JSON.parse(this.querySelector('[data-variants-json]')?.textContent || '[]');
      this.current = variants.find((v) => String(v.id) === String(initial)) || variants[0];
      if (this.current) window.LastlyTrack?.('view_item', this.payload(this.current));
    }
    payload(v) {
      return {
        currency: L.currency,
        value: v.price / 100,
        items: [{ item_id: String(v.id), item_name: this.dataset.productTitle, item_variant: v.title, price: v.price / 100, quantity: 1 }],
      };
    }
    render(variant) {
      const atcButtons = document.querySelectorAll('[data-atc-button]');
      const labels = document.querySelectorAll('[data-atc-label]');
      if (!variant) {
        atcButtons.forEach((b) => b.setAttribute('aria-disabled', 'true'));
        labels.forEach((l) => (l.textContent = L.strings.unavailable));
        return;
      }
      this.current = variant;
      document.querySelectorAll('form[data-product-form] [name="id"]').forEach((i) => (i.value = variant.id));
      atcButtons.forEach((b) => b.toggleAttribute('disabled', !variant.available));
      labels.forEach((l) => (l.textContent = variant.available ? (l.dataset.defaultLabel || L.strings.addToCart) : L.strings.soldOut));

      // Price block
      document.querySelectorAll('[data-price-current]').forEach((el) => (el.textContent = L.formatMoney(variant.price)));
      document.querySelectorAll('[data-price-compare]').forEach((el) => {
        const on = variant.compare_at_price > variant.price;
        el.hidden = !on;
        el.textContent = on ? L.formatMoney(variant.compare_at_price) : '';
      });
      document.querySelectorAll('[data-price-save]').forEach((el) => {
        const on = variant.compare_at_price > variant.price;
        el.hidden = !on;
        if (on) el.textContent = el.dataset.template.replace('[amount]', L.formatMoney(variant.compare_at_price - variant.price));
      });
      document.querySelectorAll('[data-sticky-variant]').forEach((el) => (el.textContent = variant.title));

      // Gallery: jump to the variant's image.
      if (variant.featured_media) {
        this.closest('[data-product-section]')?.querySelector('product-gallery')?.goToMedia(variant.featured_media.id);
      }
      this.offer?.update(variant);
    }
  }
  customElements.define('product-info', ProductInfo);

  /* ---------- <offer-tiers>: 1 / 2 / 3 quantity breaks ---------- */
  class OfferTiers extends HTMLElement {
    connectedCallback() {
      this.form = document.getElementById(this.dataset.form);
      this.addEventListener('change', () => this.apply());
      this.apply();
    }
    apply() {
      const checked = this.querySelector('input:checked');
      if (!checked || !this.form) return;
      const qty = this.form.querySelector('[name="quantity"]');
      if (qty) qty.value = checked.value;
      document.querySelectorAll('[data-atc-total]').forEach((el) => (el.textContent = checked.dataset.totalFormatted || ''));
    }
    /** Re-price tiers for the selected variant. Amount off mirrors the automatic discount set in admin. */
    update(variant) {
      this.querySelectorAll('input').forEach((input) => {
        const qty = Number(input.value);
        const off = Number(input.dataset.amountOff || 0);
        const total = Math.max(0, variant.price * qty - off);
        const tier = input.closest('.offer-tier');
        tier.querySelector('[data-tier-total]').textContent = L.formatMoney(total);
        const each = tier.querySelector('[data-tier-each]');
        if (each) each.textContent = each.dataset.template.replace('[price]', L.formatMoney(Math.round(total / qty)));
        const compare = tier.querySelector('[data-tier-compare]');
        if (compare) compare.textContent = off > 0 ? L.formatMoney(variant.price * qty) : '';
        input.dataset.totalFormatted = L.formatMoney(total);
      });
      this.apply();
    }
  }
  customElements.define('offer-tiers', OfferTiers);

  /* ---------- <product-gallery>: swipe (scroll-snap), dots, thumbs, zoom dialog ---------- */
  class ProductGallery extends HTMLElement {
    connectedCallback() {
      this.track = this.querySelector('[data-gallery-track]');
      this.slides = [...this.querySelectorAll('[data-media-id]')];
      this.dots = [...this.querySelectorAll('[data-gallery-dot]')];
      this.thumbs = [...this.querySelectorAll('[data-gallery-thumb]')];
      this.counter = this.querySelector('[data-gallery-counter]');
      if (!this.track) return;
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => { if (en.isIntersecting && en.intersectionRatio > 0.6) this.setActive(this.slides.indexOf(en.target)); });
      }, { root: this.track, threshold: [0.6] });
      this.slides.forEach((s) => io.observe(s));
      [...this.dots, ...this.thumbs].forEach((btn) => btn.addEventListener('click', () => this.goTo(Number(btn.dataset.index))));
      this.querySelector('[data-gallery-prev]')?.addEventListener('click', () => this.goTo(this.index - 1));
      this.querySelector('[data-gallery-next]')?.addEventListener('click', () => this.goTo(this.index + 1));
      this.track.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); this.goTo(this.index + 1); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); this.goTo(this.index - 1); }
      });
      this.zoom = this.querySelector('dialog[data-zoom]');
      this.querySelectorAll('[data-zoom-open]').forEach((btn) => btn.addEventListener('click', () => this.openZoom(btn.dataset.zoomSrc, btn.dataset.zoomAlt)));
      this.zoom?.querySelector('[data-zoom-close]')?.addEventListener('click', () => this.zoom.close());
      this.zoom?.addEventListener('click', (e) => { if (e.target === this.zoom) this.zoom.close(); });
      this.index = 0;
    }
    setActive(i) {
      this.index = i;
      this.dots.forEach((d, n) => d.setAttribute('aria-current', String(n === i)));
      this.thumbs.forEach((t, n) => t.setAttribute('aria-current', String(n === i)));
      if (this.counter) this.counter.textContent = `${i + 1} / ${this.slides.length}`;
      this.slides.forEach((s, n) => { if (n !== i) s.querySelector('video')?.pause(); });
    }
    goTo(i) {
      const n = (i + this.slides.length) % this.slides.length;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.track.scrollTo({ left: this.slides[n].offsetLeft - this.track.offsetLeft, behavior: reduce ? 'auto' : 'smooth' });
      this.setActive(n);
    }
    goToMedia(mediaId) {
      const i = this.slides.findIndex((s) => String(s.dataset.mediaId) === String(mediaId));
      if (i > -1) this.goTo(i);
    }
    openZoom(src, alt) {
      if (!this.zoom) return;
      const img = this.zoom.querySelector('img');
      img.src = src;
      img.alt = alt || '';
      this.zoom.showModal();
    }
  }
  customElements.define('product-gallery', ProductGallery);

  /* ---------- <sticky-atc>: mobile bar once the main ATC leaves the viewport ---------- */
  class StickyAtc extends HTMLElement {
    connectedCallback() {
      const target = document.querySelector('[data-main-atc]');
      if (!target) return;
      const footer = document.querySelector('.footer');
      let mainVisible = true;
      let footerVisible = false;
      const update = () => {
        const show = !mainVisible && !footerVisible;
        this.classList.toggle('is-visible', show);
        this.toggleAttribute('inert', !show);
        this.setAttribute('aria-hidden', String(!show));
      };
      new IntersectionObserver(([en]) => { mainVisible = en.isIntersecting || en.boundingClientRect.top > 0; update(); }).observe(target);
      if (footer) new IntersectionObserver(([en]) => { footerVisible = en.isIntersecting; update(); }).observe(footer);
      update();
    }
  }
  customElements.define('sticky-atc', StickyAtc);

  /* ---------- Recently viewed (localStorage handles) ---------- */
  const KEY = 'lastly_recent';
  const section = document.querySelector('[data-product-section][data-handle]');
  if (section) {
    try {
      const list = JSON.parse(localStorage.getItem(KEY) || '[]').filter((h) => h !== section.dataset.handle);
      list.unshift(section.dataset.handle);
      localStorage.setItem(KEY, JSON.stringify(list.slice(0, 8)));
    } catch (e) { /* storage blocked */ }
  }

  class RecentlyViewed extends HTMLElement {
    async connectedCallback() {
      let handles = [];
      try { handles = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return; }
      handles = handles.filter((h) => h !== this.dataset.exclude).slice(0, 4);
      if (!handles.length) return;
      const q = handles.map((h) => `handle:${h}`).join(' OR ');
      const res = await fetch(`${L.routes.root}search?q=${encodeURIComponent(q)}&type=product&section_id=${this.dataset.sectionId}`.replace('//search', '/search'));
      const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
      const grid = doc.querySelector('[data-recent-grid]');
      if (grid && grid.children.length) {
        this.querySelector('[data-recent-grid]').replaceWith(grid);
        this.hidden = false;
      }
    }
  }
  customElements.define('recently-viewed', RecentlyViewed);

  /* ---------- <fbt-picker>: frequently bought together total ---------- */
  class FbtPicker extends HTMLElement {
    connectedCallback() {
      this.addEventListener('change', () => this.update());
      this.update();
    }
    update() {
      let total = Number(this.dataset.basePrice || 0);
      this.querySelectorAll('[data-extra-variant]').forEach((cb) => { if (cb.checked) total += Number(cb.dataset.price || 0); });
      const el = this.querySelector('[data-fbt-total]');
      if (el) el.textContent = L.formatMoney(total);
    }
  }
  customElements.define('fbt-picker', FbtPicker);
})();
