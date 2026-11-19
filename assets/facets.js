/**
 * facets.js — collection/search filtering, sorting and "load more" without page reloads.
 * Uses Section Rendering: fetch(url + '&section_id=<id>') and swap the results + facet markup.
 * Works without JS: the form submits normally (GET).
 */
(() => {
  const L = window.Lastly;

  class FacetFiltersForm extends HTMLElement {
    connectedCallback() {
      this.sectionId = this.dataset.sectionId;
      this.addEventListener('change', L.debounce((e) => {
        if (e.target.closest('[data-facet-ignore]')) return;
        this.submit(e.target.form || this.querySelector('form'));
      }, 300));
      this.addEventListener('submit', (e) => { e.preventDefault(); this.submit(e.target); });
      document.addEventListener('click', (e) => {
        const link = e.target.closest('[data-facet-link]');
        if (!link) return;
        e.preventDefault();
        this.load(link.href);
      });
      window.addEventListener('popstate', () => this.load(location.href, false));
    }
    submit(form) {
      const params = new URLSearchParams(new FormData(form));
      // Keep the sort select (which can live outside the filter form) in sync.
      const sort = document.querySelector('[data-sort-select]');
      if (sort && !params.has('sort_by')) params.set('sort_by', sort.value);
      [...params.entries()].forEach(([k, v]) => { if (v === '') params.delete(k); });
      this.load(`${location.pathname}?${params.toString()}`);
    }
    async load(url, push = true) {
      const results = document.querySelector('[data-facet-results]');
      results?.setAttribute('aria-busy', 'true');
      try {
        const u = new URL(url, location.origin);
        u.searchParams.set('section_id', this.sectionId);
        const html = await (await fetch(u.toString())).text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        ['[data-facet-results]', '[data-facet-sidebar]', '[data-facet-drawer-body]', '[data-facet-active]', '[data-facet-count]'].forEach((sel) => {
          const fresh = doc.querySelector(sel);
          document.querySelectorAll(sel).forEach((el) => { if (fresh) el.innerHTML = fresh.innerHTML; });
        });
        if (push) {
          u.searchParams.delete('section_id');
          history.pushState({}, '', u.pathname + u.search);
        }
        const live = document.querySelector('[data-facet-live]');
        const count = doc.querySelector('[data-facet-count]');
        if (live && count) live.textContent = count.textContent.trim();
      } finally {
        document.querySelector('[data-facet-results]')?.removeAttribute('aria-busy');
      }
    }
  }
  customElements.define('facet-filters-form', FacetFiltersForm);

  /* ---------- <load-more>: appends the next page of products ---------- */
  class LoadMore extends HTMLElement {
    connectedCallback() {
      this.button = this.querySelector('button');
      this.button?.addEventListener('click', () => this.load());
    }
    async load() {
      const next = this.dataset.next;
      if (!next) return;
      this.button.classList.add('is-loading');
      const u = new URL(next, location.origin);
      u.searchParams.set('section_id', this.dataset.sectionId);
      const doc = new DOMParser().parseFromString(await (await fetch(u.toString())).text(), 'text/html');
      const grid = document.querySelector('[data-product-grid]');
      const freshGrid = doc.querySelector('[data-product-grid]');
      const firstNew = freshGrid?.firstElementChild;
      freshGrid && [...freshGrid.children].forEach((li) => grid.appendChild(li));
      const freshMore = doc.querySelector('load-more');
      const status = doc.querySelector('[data-showing]');
      document.querySelectorAll('[data-showing]').forEach((el) => { if (status) el.textContent = status.textContent; });
      if (freshMore) this.replaceWith(freshMore);
      else this.remove();
      // Move focus to the first new product for keyboard/screen-reader users.
      firstNew?.querySelector('a')?.focus({ preventScroll: false });
    }
  }
  customElements.define('load-more', LoadMore);

  // Sort select outside the form.
  document.addEventListener('change', (e) => {
    const sort = e.target.closest('[data-sort-select]');
    if (!sort) return;
    const form = document.querySelector('facet-filters-form');
    form?.submit(form.querySelector('form'));
  });
})();
