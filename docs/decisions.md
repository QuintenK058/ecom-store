# Decisions & assumptions

| # | Date | Decision | Why / status |
|---|---|---|---|
| 1 | 2026-11-19 | Niche: premium rechargeable fabric shaver, single hero product | Chosen by owner from 4 options. Strong before/after for mobile paid social; clear objections we can answer. |
| 2 | 2026-11-19 | Working brand name **Lastly** | Owner didn't want to pick a domain yet. Name is used only in copy + shop settings, easy to swap. **Trademark search still needed.** |
| 3 | 2026-11-19 | Pricing: $49 single, $89 pair, $19 blade refill, free shipping over $60, AOV target $75 | Assumption. Undercuts Steamery (~$65) while staying clearly premium vs $15–30 Amazon units. Refill corrected from $39 (proposed earlier) to $19 — $39 is too high for a consumable. |
| 4 | 2026-11-19 | Checkout: build for Shopify checkout by default; Whop/Lasso swappable via `assets/checkout-handoff.js` | Owner hasn't chosen; isolation makes it a one-file change. |
| 5 | 2026-11-19 | 30-day returns, [1-year warranty] | Assumption; matches category norm (Steamery: 30 days, 1 yr). |
| 6 | 2026-11-19 | Fonts: Newsreader + Hanken Grotesk, self-hosted | Distinctive editorial serif + highly legible grotesk; avoids the Inter-only look. Self-hosting = no Google Fonts request, better LCP. |
| 7 | 2026-11-19 | Primary color deep Fir instead of sage | Category leader (Steamery) owns pastel sage; Fir reads serious/trustworthy and gives an 11.8:1 CTA. |
| 8 | 2026-11-19 | Target customer 28–50, mid/premium knitwear buyers, US | Assumption from category + price point; validate with first ad tests. |
| 9 | 2026-11-19 | New Shopify store "Lastly" created as a PreviewStore, country NL | Kept fully separate from the existing Lottie & Grace store. Business country set to NL (owner's location) so test checkout works. **Store currency defaulted to EUR — switch to USD in Settings → Store details before the first sale** (or sell in USD via a US market). Prices were entered as 49 / 19. |
| 10 | 2026-11-19 | Products: The Lastly Shaver (Fir / Oat / Persimmon, 49) + Replacement Blade Heads 2-Pack (19); collection "Shop all" (`/collections/shop`) | "The Pair" is sold as quantity 2 with an automatic volume discount (to be created), not as a separate product — keeps inventory and reviews on one product. |
| 11 | 2026-11-19 | Repo = theme root, branches `main` (live) and `staging` (test), connected via Shopify GitHub integration | Shopify's integration requires theme folders at the repo root. |
| 12 | 2026-11-19 | Vercel is not used for the Shopify theme | Liquid themes run only on Shopify. Deploy path is GitHub → Shopify GitHub integration. |
| 13 | 2026-11-19 | Bundle tiers use a fixed amount off ($9 off 2 = $89, $28 off 3 = $119) | Exact prices, and maps 1:1 onto Shopify automatic "Amount off products" discounts with a minimum quantity. **Create these two discounts in admin**, or checkout will show full price. |
| 14 | 2026-11-19 | Fonts self-hosted (Newsreader + Hanken Grotesk, latin subsets, ~230 KB total, 2 preloaded) | Avoids Google Fonts round-trip; OFL licensed. |
| 15 | 2026-11-19 | Reviews show nothing until real reviews exist (review app metafields or hand-entered real reviews) | FTC compliance; no fake stars/counts. Recommended app: Judge.me (free tier) or Okendo. |
| 16 | 2026-11-19 | Email capture uses Shopify customer forms tagged `newsletter` | Klaviyo's Shopify integration syncs these. Popup also accepts a Klaviyo embed. |
| 17 | 2026-11-19 | Delivery estimate computed client-side in US Eastern with US federal holidays, hidden until computed | No fake dates. Cut-off and business days are Theme settings. |
| 18 | 2026-11-19 | "Frequently bought together" uses a fallback product list (blade refill) | Shopify complementary recommendations only load asynchronously; wire later if needed. |
| 19 | 2026-11-19 | Whop/Lasso handoff parameter format is an assumption (`items=variantId:qty,...`) | **Confirm with Whop/Lasso** before switching the provider setting. Code is isolated in `assets/checkout-handoff.js`. |
| 20 | 2026-11-19 | Removed the `bestseller` tag from the hero product | "Bestseller" is a claim; re-add once sales data supports it. |
