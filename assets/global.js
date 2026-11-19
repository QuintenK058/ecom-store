/**
 * Lastly — global utilities + shared web components.
 * No dependencies. Every component is progressive: the page works without JS.
 */
(() => {
  const L = (window.Lastly = window.Lastly || {});

  /* ---------- Utilities ---------- */
  L.debounce = (fn, wait = 250) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  };

  L.fetchJSON = async (url, options = {}) => {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      ...options,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(data.description || data.message || 'Request failed'), { data, status: res.status });
    return data;
  };

  /** Format cents using the shop's money format ({{amount}}, {{amount_no_decimals}} ...). */
  L.formatMoney = (cents, format = L.moneyFormat || '${{amount}}') => {
    const value = Number(cents) / 100;
    const fmt = (n, d, ts = ',', ds = '.') => {
      const [i, f] = n.toFixed(d).split('.');
      return i.replace(/\B(?=(\d{3})+(?!\d))/g, ts) + (f ? ds + f : '');
    };
    return format.replace(/\{\{\s*(\w+)\s*\}\}/, (_, key) => {
      switch (key) {
        case 'amount_no_decimals': return fmt(value, 0);
        case 'amount_with_comma_separator': return fmt(value, 2, '.', ',');
        case 'amount_no_decimals_with_comma_separator': return fmt(value, 0, '.', ',');
        default: return fmt(value, 2);
      }
    });
  };

  L.toast = (message, ms = 2600) => {
    const el = document.querySelector('[data-toast]');
    if (!el) return;
    el.textContent = message;
    el.hidden = false;
    clearTimeout(L._toastTimer);
    L._toastTimer = setTimeout(() => { el.hidden = true; }, ms);
  };

  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  /** Keeps Tab focus inside `container`. Returns a cleanup function. */
  L.trapFocus = (container, initial) => {
    const handler = (e) => {
      if (e.key !== 'Tab') return;
      const items = [...container.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', handler);
    (initial || container.querySelector(FOCUSABLE) || container).focus({ preventScroll: true });
    return () => document.removeEventListener('keydown', handler);
  };

  /* ---------- <modal-drawer>: menu, cart, filters, search, popup ---------- */
  class ModalDrawer extends HTMLElement {
    connectedCallback() {
      this.addEventListener('click', (e) => {
        if (e.target.closest('[data-drawer-close]')) this.close();
      });
      this.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.close(); });
    }
    get isOpen() { return this.classList.contains('is-open'); }
    open(trigger) {
      if (this.isOpen) return;
      this.trigger = trigger || document.activeElement;
      this.hidden = false;
      this.removeAttribute('aria-hidden');
      requestAnimationFrame(() => this.classList.add('is-open'));
      document.body.classList.add('scroll-locked');
      document.querySelectorAll(`[aria-controls="${this.id}"]`).forEach((b) => b.setAttribute('aria-expanded', 'true'));
      const panel = this.querySelector('[role="dialog"]') || this;
      this.releaseFocus = L.trapFocus(panel, this.querySelector('[data-autofocus]'));
      this.dispatchEvent(new CustomEvent('drawer:open', { bubbles: true }));
    }
    close() {
      if (!this.isOpen) return;
      this.classList.remove('is-open');
      this.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('scroll-locked');
      document.querySelectorAll(`[aria-controls="${this.id}"]`).forEach((b) => b.setAttribute('aria-expanded', 'false'));
      if (this.releaseFocus) this.releaseFocus();
      if (this.trigger && this.trigger.focus) this.trigger.focus({ preventScroll: true });
      this.dispatchEvent(new CustomEvent('drawer:close', { bubbles: true }));
    }
  }
  customElements.define('modal-drawer', ModalDrawer);

  // Any element with data-drawer-open="<id>" opens that drawer.
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-drawer-open]');
    if (!trigger) return;
    const drawer = document.getElementById(trigger.dataset.drawerOpen);
    if (!drawer || typeof drawer.open !== 'function') return;
    e.preventDefault();
    drawer.open(trigger);
  });

  /* ---------- <announcement-bar>: max 3 rotating messages ---------- */
  class AnnouncementBar extends HTMLElement {
    connectedCallback() {
      this.slides = [...this.querySelectorAll('.announcement__slide')];
      this.index = 0;
      this.paused = false;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (this.slides.length < 2) return;
      this.querySelector('[data-prev]')?.addEventListener('click', () => this.go(this.index - 1));
      this.querySelector('[data-next]')?.addEventListener('click', () => this.go(this.index + 1));
      this.pauseBtn = this.querySelector('[data-pause]');
      this.pauseBtn?.addEventListener('click', () => this.togglePause());
      this.addEventListener('mouseenter', () => this.stop());
      this.addEventListener('mouseleave', () => !this.paused && this.start());
      this.addEventListener('focusin', () => this.stop());
      if (!reduce) this.start();
      else this.setPaused(true);
    }
    go(i) {
      this.slides[this.index].classList.remove('is-active');
      this.slides[this.index].setAttribute('aria-hidden', 'true');
      this.index = (i + this.slides.length) % this.slides.length;
      this.slides[this.index].classList.add('is-active');
      this.slides[this.index].removeAttribute('aria-hidden');
    }
    start() { this.stop(); this.timer = setInterval(() => this.go(this.index + 1), Number(this.dataset.speed || 5000)); }
    stop() { clearInterval(this.timer); }
    setPaused(state) {
      this.paused = state;
      if (this.pauseBtn) {
        this.pauseBtn.setAttribute('aria-pressed', String(state));
        this.pauseBtn.setAttribute('aria-label', state ? this.pauseBtn.dataset.playLabel : this.pauseBtn.dataset.pauseLabel);
        this.pauseBtn.querySelector('[data-icon-pause]').hidden = state;
        this.pauseBtn.querySelector('[data-icon-play]').hidden = !state;
      }
    }
    togglePause() { this.setPaused(!this.paused); this.paused ? this.stop() : this.start(); }
  }
  customElements.define('announcement-bar', AnnouncementBar);

  /* ---------- <sticky-header>: hides on scroll-down, shows on scroll-up ---------- */
  class StickyHeader extends HTMLElement {
    connectedCallback() {
      this.last = window.scrollY;
      this.onScroll = () => {
        const y = window.scrollY;
        this.classList.toggle('is-scrolled', y > 8);
        // Never hide while a drawer is open or focus is inside the header.
        const busy = document.body.classList.contains('scroll-locked') || this.contains(document.activeElement);
        if (!busy && y > this.offsetHeight * 2 && y > this.last + 4) this.classList.add('is-hidden');
        else if (y < this.last - 4 || y < this.offsetHeight) this.classList.remove('is-hidden');
        this.last = y;
        document.documentElement.style.setProperty('--header-offset', this.classList.contains('is-hidden') ? '0px' : `${this.offsetHeight}px`);
      };
      window.addEventListener('scroll', this.onScroll, { passive: true });
      this.addEventListener('focusin', () => this.classList.remove('is-hidden'));
      this.onScroll();
    }
    disconnectedCallback() { window.removeEventListener('scroll', this.onScroll); }
  }
  customElements.define('sticky-header', StickyHeader);

  /* ---------- <quantity-input> ---------- */
  class QuantityInput extends HTMLElement {
    connectedCallback() {
      this.input = this.querySelector('input');
      this.querySelectorAll('button[name]').forEach((btn) =>
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const prev = this.input.value;
          btn.name === 'plus' ? this.input.stepUp() : this.input.stepDown();
          if (prev !== this.input.value) this.input.dispatchEvent(new Event('change', { bubbles: true }));
        })
      );
    }
  }
  customElements.define('quantity-input', QuantityInput);

  /* ---------- <before-after>: keyboard-accessible comparison slider ---------- */
  class BeforeAfter extends HTMLElement {
    connectedCallback() {
      const range = this.querySelector('input[type="range"]');
      const set = () => this.style.setProperty('--pos', `${range.value}%`);
      range?.addEventListener('input', set);
      set();
    }
  }
  customElements.define('before-after', BeforeAfter);

  /* ---------- <slider-component>: native scroll-snap + prev/next buttons ---------- */
  class SliderComponent extends HTMLElement {
    connectedCallback() {
      this.track = this.querySelector('[data-slider-track]');
      if (!this.track) return;
      const step = () => (this.track.firstElementChild?.getBoundingClientRect().width || 300) + 12;
      this.querySelector('[data-slider-prev]')?.addEventListener('click', () => this.track.scrollBy({ left: -step(), behavior: 'smooth' }));
      this.querySelector('[data-slider-next]')?.addEventListener('click', () => this.track.scrollBy({ left: step(), behavior: 'smooth' }));
    }
  }
  customElements.define('slider-component', SliderComponent);

  /* ---------- <predictive-search> ---------- */
  class PredictiveSearch extends HTMLElement {
    connectedCallback() {
      this.input = this.querySelector('input[type="search"]');
      this.results = this.querySelector('[data-predictive-results]');
      this.status = this.querySelector('[data-predictive-status]');
      if (!this.input) return;
      this.input.addEventListener('input', L.debounce(() => this.search(), 220));
      this.input.addEventListener('keydown', (e) => this.onKey(e));
    }
    async search() {
      const q = this.input.value.trim();
      if (q.length < 2) { this.results.innerHTML = ''; this.input.setAttribute('aria-expanded', 'false'); return; }
      this.abort?.abort();
      this.abort = new AbortController();
      try {
        const url = `${L.routes.predictiveSearch}?q=${encodeURIComponent(q)}&resources[type]=product,page,query&resources[limit]=6&section_id=predictive-search`;
        const res = await fetch(url, { signal: this.abort.signal });
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const fresh = doc.querySelector('[data-predictive-content]');
        this.results.innerHTML = fresh ? fresh.innerHTML : '';
        const count = this.results.querySelectorAll('[role="option"]').length;
        this.input.setAttribute('aria-expanded', String(count > 0));
        if (this.status) this.status.textContent = `${count} results`;
      } catch (err) {
        if (err.name !== 'AbortError') this.results.innerHTML = '';
      }
    }
    onKey(e) {
      const options = [...this.results.querySelectorAll('[role="option"]')];
      if (!options.length || !['ArrowDown', 'ArrowUp', 'Enter'].includes(e.key)) return;
      let i = options.findIndex((o) => o.getAttribute('aria-selected') === 'true');
      if (e.key === 'Enter') { if (i > -1) { e.preventDefault(); options[i].click(); } return; }
      e.preventDefault();
      if (i > -1) options[i].setAttribute('aria-selected', 'false');
      i = e.key === 'ArrowDown' ? (i + 1) % options.length : (i - 1 + options.length) % options.length;
      options[i].setAttribute('aria-selected', 'true');
      this.input.setAttribute('aria-activedescendant', options[i].id);
      options[i].scrollIntoView({ block: 'nearest' });
    }
  }
  customElements.define('predictive-search', PredictiveSearch);

  /* ---------- <newsletter-popup>: exit-intent (desktop) / time or scroll (mobile), frequency-capped ---------- */
  class NewsletterPopup extends HTMLElement {
    connectedCallback() {
      this.drawer = this.querySelector('modal-drawer');
      const key = 'lastly_popup_seen';
      const capDays = Number(this.dataset.capDays || 14);
      let seen = 0;
      try { seen = Number(localStorage.getItem(key) || 0); } catch (e) { /* storage blocked */ }
      if (Date.now() - seen < capDays * 864e5) return;
      if (/[?&](customer_posted|form_type)=/.test(location.search)) return;
      if (document.body.classList.contains('template-cart') || document.body.classList.contains('template-password')) return;

      const show = () => {
        if (this.shown || document.body.classList.contains('scroll-locked')) return;
        this.shown = true;
        try { localStorage.setItem(key, String(Date.now())); } catch (e) { /* noop */ }
        this.drawer?.open();
        window.LastlyTrack?.('popup_view', {});
        cleanup();
      };
      const isDesktop = window.matchMedia('(min-width: 1024px) and (hover: hover)').matches;
      const delay = Number(this.dataset.delay || 15) * 1000;
      const onLeave = (e) => { if (e.clientY <= 0) show(); };
      const onScroll = () => {
        const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
        if (pct > 0.5) show();
      };
      const timer = setTimeout(show, isDesktop ? delay * 3 : delay);
      if (isDesktop) document.addEventListener('mouseout', onLeave);
      else window.addEventListener('scroll', onScroll, { passive: true });
      const cleanup = () => {
        clearTimeout(timer);
        document.removeEventListener('mouseout', onLeave);
        window.removeEventListener('scroll', onScroll);
      };
    }
  }
  customElements.define('newsletter-popup', NewsletterPopup);

  /* ---------- <delivery-estimate>: business days, US Eastern cut-off, US federal holidays ---------- */
  class DeliveryEstimate extends HTMLElement {
    connectedCallback() {
      const cfg = L.shipping || {};
      const min = Number(this.dataset.min || cfg.minDays || 3);
      const max = Number(this.dataset.max || cfg.maxDays || 5);
      const cutoff = Number(this.dataset.cutoff || cfg.cutoffHour || 14);

      // "Now" in US Eastern, independent of the visitor's timezone.
      const et = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
      const holidays = DeliveryEstimate.holidays(et.getFullYear()).concat(DeliveryEstimate.holidays(et.getFullYear() + 1));
      const isBusinessDay = (d) => d.getDay() !== 0 && d.getDay() !== 6 && !holidays.includes(d.toDateString());

      // Ship day: today if before cut-off on a business day, else next business day.
      const ship = new Date(et);
      if (!isBusinessDay(ship) || et.getHours() >= cutoff) {
        do { ship.setDate(ship.getDate() + 1); } while (!isBusinessDay(ship));
      }
      const addBusinessDays = (from, n) => {
        const d = new Date(from);
        let added = 0;
        while (added < n) { d.setDate(d.getDate() + 1); if (isBusinessDay(d)) added++; }
        return d;
      };
      const start = addBusinessDays(ship, min);
      const end = addBusinessDays(ship, max);
      const fmt = (d) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

      const shipsToday = ship.toDateString() === et.toDateString();
      const dateEl = this.querySelector('[data-date]');
      const timeEl = this.querySelector('[data-countdown]');
      if (dateEl) dateEl.textContent = min === max ? fmt(end) : `${fmt(start)} – ${fmt(end)}`;
      if (timeEl) {
        if (shipsToday) {
          const mins = (cutoff - et.getHours()) * 60 - et.getMinutes();
          const h = Math.floor(mins / 60);
          const m = mins % 60;
          timeEl.textContent = h > 0 ? `${h} hr ${m} min` : `${m} min`;
          this.querySelector('[data-countdown-wrap]')?.removeAttribute('hidden');
        }
      }
      this.hidden = false;
    }
    /** Observed US federal holidays (carriers don't deliver). */
    static holidays(y) {
      const nth = (month, weekday, n) => {
        const d = new Date(y, month, 1);
        const offset = (weekday - d.getDay() + 7) % 7;
        return new Date(y, month, 1 + offset + (n - 1) * 7);
      };
      const last = (month, weekday) => {
        const d = new Date(y, month + 1, 0);
        d.setDate(d.getDate() - ((d.getDay() - weekday + 7) % 7));
        return d;
      };
      const observed = (d) => {
        if (d.getDay() === 6) d.setDate(d.getDate() - 1);
        else if (d.getDay() === 0) d.setDate(d.getDate() + 1);
        return d;
      };
      return [
        observed(new Date(y, 0, 1)),
        nth(0, 1, 3), // MLK
        nth(1, 1, 3), // Presidents
        last(4, 1), // Memorial
        observed(new Date(y, 5, 19)),
        observed(new Date(y, 6, 4)),
        nth(8, 1, 1), // Labor
        nth(9, 1, 2), // Columbus
        observed(new Date(y, 10, 11)),
        nth(10, 4, 4), // Thanksgiving
        observed(new Date(y, 11, 25)),
      ].map((d) => d.toDateString());
    }
  }
  customElements.define('delivery-estimate', DeliveryEstimate);

  /* ---------- Newsletter forms: show Shopify's success state inline ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    if (/customer_posted=true/.test(location.search)) L.toast(document.documentElement.dataset.newsletterSuccess || "You're in. Check your inbox.");
  });
})();
