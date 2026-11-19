# Top 10 A/B tests after launch

Run one test per page at a time. Minimum ~1,000 sessions per variant or 2 full weeks
(whichever is longer). Primary metric first, guardrail in brackets.

| # | Test | Hypothesis | Primary metric (guardrail) |
|---|---|---|---|
| 1 | **PDP default tier**: pre-select "The Pair" (current) vs "1 Shaver" | Defaulting to the 2-pack raises AOV more than it costs in conversion. | AOV, revenue/visitor (CVR) |
| 2 | **Hero visual**: before/after split image vs lifestyle shot | Showing the problem solved in the first viewport lifts click-through from paid social. | Hero CTA CTR, PDP reach (bounce) |
| 3 | **Headline**: "It's not worn out. It's just pilled." vs "Make your sweaters look new in 5 minutes." | Concrete outcome + time beats reframe for cold traffic. | Add-to-cart rate (bounce) |
| 4 | **Ad traffic landing**: homepage vs PDP direct | For a single-product brand, sending paid social straight to the PDP shortens the path. | CVR, revenue/session |
| 5 | **Free-shipping threshold**: $60 vs $50 | $60 pushes single buyers to add a refill; $50 may convert more single orders. | Revenue/visitor (CVR, shipping cost %) |
| 6 | **Cart upsell**: blade refill vs none | A complementary $19 add-on lifts AOV without hurting checkout rate. | AOV, upsell attach rate (checkout rate) |
| 7 | **Sticky ATC copy**: "Add to cart" vs price-in-button ("Add · $89") | Showing the price reduces surprise and raises sticky-bar taps. | Sticky ATC CTR (CVR) |
| 8 | **Guarantee placement**: guarantee block directly under buy buttons vs below the fold | Risk reversal at the decision point lifts ATC for hesitant buyers. | ATC rate |
| 9 | **Popup offer**: 10% off vs free blade refill with first order | A product gift protects margin and raises AOV vs a % discount. | Email capture rate, first-order margin |
| 10 | **Comparison table**: present vs removed on PDP | Explicit "vs drugstore shaver" answers the "$15 one is the same" objection. | ATC rate, scroll depth to buy buttons |

## How to run
- Use a theme-based testing tool (e.g. Shoplift, Intelligems for price/shipping tests) — the theme's
  sections are already split so each variant is a template or section setting change.
- `data-track` attributes on every key CTA + `lastly:*` custom events (see `assets/analytics.js`)
  give you click-level metrics in GA4/GTM and Shopify Customer Events.
