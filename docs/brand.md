# Lastly — Brand Foundation (Phase 0)

> Working name. Swappable: the name lives in `settings_data.json` / shop name and in copy only.
> Status: **DRAFT — awaiting approval.** Nothing in Phase 1+ gets built until this is signed off.

---

## 1. Market research

### The category
Electric fabric shavers ("de-pillers", "defuzzers") remove pills — the little balls of tangled
fiber that form on sweaters, knits, leggings, coats, couches and blankets from friction.
Pilling makes a perfectly good garment look worn out, and most people respond by throwing it out
or never wearing it.

### Who's selling it

| Player | Price (US) | What they claim | Where they're weak |
|---|---|---|---|
| **Steamery Pilo 2** (SE) | ~$55–75 at retail | Design object, 9,000 rpm, USB-C, 6 blades, ~2" head | Positioned as a Scandi lifestyle accessory, not a fix. US is a secondary market: free shipping only over $130, 4–7 business days, colors out of stock. Reviewers flag a USB-C port that only works with a C-to-A cable. Thin US reviews. |
| **Conair** (battery) | ~$10–20 | Cheap, everywhere, "best overall" in several roundups | Burns through AA batteries, dies after light use per retail reviews, tiny lint bin, looks like a drugstore gadget. |
| **BEAUTURAL / Amazon rechargeables** | ~$15–30 | Rechargeable, 3 heights, big head | Generic, interchangeable, no brand, no guidance. Customers can't tell them apart. |
| **Gleener** (manual) | ~$20–25 | No batteries, 3 edges, travel-friendly | Slow, takes effort, doesn't make fabric "look new" in side-by-side tests. |
| **Evercare / Electrolux** (Target) | ~$15–35 | Household brand trust | Reports of holes in garments; guard flexes under pressure. |

### What everyone claims
"Removes lint and pills." "Powerful motor." "Safe for all fabrics." "Rechargeable." Specs and
rpm. Nobody owns an *outcome* or a *point of view*.

### The real objections (from reviews across retailers)
1. **"Will it put a hole in my sweater?"** — the #1 fear, and a real failure mode on cheap guards.
2. **"The battery dies / it stops working."**
3. **"The lint bin fills up every 30 seconds."**
4. "Does it work on cashmere / merino / my couch?"
5. "Isn't a $15 one the same thing?"

### The gap we own
The cheap end is disposable and scary to use on good clothes. The premium end (Steamery) sells
*design*, not *confidence*, and under-serves the US. **Nobody is the US brand that says: this is
the safe, serious tool for clothes you actually care about — and here's exactly how to use it.**
We win on *trust on good fabric* + *US-native experience* (fast shipping, real guarantee,
how-to content), not on rpm.

---

## 2. Positioning

**One-line promise:**
**Keep the sweater. Lose the pills.**

Long form: Lastly is the fabric shaver built for clothes you love — a guarded, rechargeable
shaver that makes knits look new in minutes, without the fear of holes.

### 3 proof pillars
1. **Safe on good fabric.** Rigid stainless guard that doesn't flex, [2] height settings, and a
   cashmere-safe setting. Backed by a [hole-free guarantee — verify terms]. *(Answers objection #1.)*
2. **Built to last as long as your clothes.** USB-C fast charge (any cable), [90 min] runtime,
   oversized lint chamber, replaceable blades. *(Answers #2 and #3.)*
3. **Results you can see in one pass.** Wide [2.4"] head, [6] blades — a sweater in about [5]
   minutes. Before/after is the hero of every photo and ad. *(Answers #5.)*

### The enemy
**Throwaway thinking.** The old way: a sweater pills, it "looks cheap," it goes to the donation
bag or the back of the closet, and you buy another one. Or you grab a $12 drugstore shaver that
eats batteries and chews a hole in the elbow.
*Our line: "It's not worn out. It's just pilled."*

### Customer (working assumption — see decisions.md)
Women and men 28–50, US, buy mid-to-premium knitwear (J.Crew, Madewell, Everlane, Quince
cashmere, Aritzia). Care about looking put-together, quietly anti-waste, short on time.
Hits the problem every fall/winter. Gifts it (Q4 is peak — today is Nov 19).

---

## 3. Voice

**Calm. Specific. Quietly witty.**

We sound like the friend who knows how to take care of things — not a gadget infomercial,
not a luxury brand whispering. Short sentences. Real numbers. One small smile per page, max.

| Do | Don't |
|---|---|
| "It's not worn out. It's just pilled." | "Revolutionize your wardrobe care routine!" |
| "One sweater, about five minutes." | "Lightning-fast, powerful performance." |
| "A guard that doesn't flex, so the blades never touch the knit." | "Premium safe technology for all fabrics." |
| "Charges with any USB-C cable. Yes, any." | "Convenient modern charging solution." |
| "Get my Lastly" | "Shop now" / "Buy now" (where a specific CTA fits) |
| "Free 30-day returns. Use it on your favorite sweater first." | "100% satisfaction guaranteed!!!" |

**Banned words:** elevate, unleash, game-changer, revolutionize, transform your, must-have,
luxury (as a self-claim), effortless, seamless, curated, "say goodbye to".
**Rules:** US spelling. Numerals for numbers. Sentence case headlines. No exclamation marks in
headlines. Every claim that needs proof is in [brackets] until verified.

---

## 4. Visual identity (summary — full spec in `tokens.md`)

**Concept: "The well-kept closet."** Warm undyed-wool neutrals, one deep fir green that reads
serious and natural, and a persimmon accent used like a single colored thread. Editorial serif
headlines, clean grotesk body. Lots of air. Texture comes from photography (knit close-ups),
never from decorative UI.

- **Primary — Fir `#1F3D34`:** CTAs, header, key UI. Deep, calm, not the pastel sage everyone
  in this category uses (Steamery).
- **Accent — Persimmon `#B5461F`:** badges, "Most popular", highlights, star fills. Never on
  large areas.
- **Neutrals:** Oat `#F5F0E7` (page), Linen `#EBE4D7` (cards/sections), Ink `#1C1B19` (text),
  Graphite `#57534B` (secondary text), Stone `#8C8475` (borders only).
- **Type:** **Newsreader** (display, editorial serif with optical sizes) + **Hanken Grotesk**
  (body/UI). Two families, self-hosted, `font-display: swap`.

### Photography & art direction
- **Light:** soft natural window light, morning. Gentle shadows, never flash, never pure white
  seamless.
- **Backgrounds:** oat/linen paper, raw wood, folded knits, unmade bed linen. Warm, matte.
- **Hero shot:** the shaver mid-pass on a cable-knit sweater, half the fabric pilled, half clean.
  The *line* between before and after is the brand image.
- **Crops:** tight macro of fibers (pills visible), hands-in-frame at 4:5, product flat-lay at 1:1.
  Mobile hero is a separate 4:5 crop with the product in the lower two-thirds.
- **Ratio:** 60% in-use / before-after, 25% lifestyle (person in the sweater, couch, travel),
  15% clean product.
- **People:** real, mid-30s-ish, mixed ages and backgrounds, natural skin, not models posing with
  a gadget. Hands matter more than faces.
- **Never:** stock-photo smiles, lint "explosions", fake before/afters (FTC — all before/afters
  must be real, unretouched beyond color correction).

### Iconography
1.5px stroke line icons on a 24px grid, rounded caps and joins, no fills, Ink or Fir.
Custom set kept small (~16): shipping, returns, shield/guard, battery, USB-C, blade, sweater,
couch, clock, check, x, star, plus/minus, chevron, close, search, bag, user. Inline SVG via
`snippets/icon.liquid`.

---

## 5. Offer (working assumption)

| | Price | Notes |
|---|---|---|
| Lastly Shaver (1) | **$49** | Colors: Fir, Oat, [Persimmon] |
| The Pair (2) — *Most popular* | **$89** ($44.50 each) | "One for you, one to give." Q4 hero. |
| Blade refill (2 heads) | **$19** | Cart upsell, 1-click |
| Shaver + refill kit | [$59] | Optional "best value" |

Free US shipping over **$60** (pushes 1 → shaver + refill). 30-day returns. [1-year warranty].
AOV target **$75**.
