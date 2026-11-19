# Metafields & metaobjects

Everything product-specific on the PDP is driven by metafields, so each product gets its own
benefits, FAQ, comparison and specs without code changes.
Create these in **Settings → Custom data → Products** (namespace `custom` unless noted).

## Product metafields

| Key | Type | Used in | Notes |
|---|---|---|---|
| `custom.subtitle` | Single line text | PDP title block, product card | 1-line value prop, e.g. "The fabric shaver for clothes you love" |
| `custom.benefits` | List: single line text | PDP benefit bullets, product spotlight | 3–4 outcomes, not features. Falls back to block setting. |
| `custom.badge` | Single line text | Product card badge | Only real claims ("New", "Bestseller" once true) |
| `custom.details` | Rich text | PDP accordion "Details & specs" | Falls back to accordion block text |
| `custom.how_to_use` | Rich text | PDP accordion "How to use" | |
| `custom.whats_included` | Rich text | PDP accordion "What's included" | |
| `custom.comparison` | JSON | Comparison section (`use_metafield` on) | Schema below |
| `custom.faq` | List: metaobject reference (`faq_item`) | FAQ section (`use_metafield` on) + FAQPage JSON-LD | Falls back to section blocks |
| `reviews.rating` | Rating | Stars on card/PDP/hero, AggregateRating JSON-LD | **Written by your review app.** Never set by hand. |
| `reviews.rating_count` | Integer | Review count | Written by review app |

## Collection metafields

| Key | Type | Used in |
|---|---|---|
| `custom.tagline` | Single line text | Slim 1-line collection description under the title |

## Variant option swatches

Color swatches use Shopify's native **category metafield swatches** (Settings → Custom data →
or the product's Color option linked to the `shopify.color-pattern` metaobject). The theme reads
`value.swatch.color`. Enable "Show color options as swatches" on the Variant picker block.

## Metaobject: `faq_item`

| Field | Key | Type |
|---|---|---|
| Question | `question` | Single line text |
| Answer | `answer` | Rich text |

## `custom.comparison` JSON schema

```json
{
  "columns": ["Lastly", "Drugstore shaver", "Lint roller"],
  "rows": [
    { "label": "Removes pills (not just lint)", "values": ["yes", "yes", "no"] },
    { "label": "Runtime per charge", "values": ["[90 min]", "AA batteries", "—"] }
  ]
}
```
`"yes"` / `"no"` render as check / dash icons; any other string renders as text. First column is
highlighted as "us".

## Section-level settings that rely on data

- **Hero → "Show star rating of"**: renders only if that product has `reviews.rating` + count > 0.
- **Reviews section**: hidden on the live store until it has real review blocks or an app block.
- **Low stock message**: only when inventory is tracked by Shopify and ≤ threshold (default 5).
- **Badges**: sold out (inventory), Save $X (compare-at price), `custom.badge`, or tag `bestseller`.
