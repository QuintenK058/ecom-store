# Lastly — Shopify store

Premium rechargeable fabric shaver, DTC, US market.
Working brand name: **Lastly** ("Keep the sweater. Lose the pills.").

## Repo layout

This repo *is* the Shopify theme (Online Store 2.0). Shopify's GitHub integration requires theme
folders at the repo root:

```
assets/      CSS (tokens.css = design tokens), JS web components, self-hosted fonts
blocks/      theme blocks
config/      settings_schema.json, settings_data.json
layout/      theme.liquid
locales/     en.default.json
sections/    one section per file
snippets/    product-card, price, rating, icon, badge, ...
templates/   JSON templates (+ customers/)
docs/        brand, tokens, metafields, decisions, todo-verify, CRO test ideas (not pushed to Shopify)
```

## Branches

| Branch | Connected to | Use |
|---|---|---|
| `main` | Live theme (after launch) | Only merge reviewed work |
| `staging` | Unpublished "Staging" theme | Test everything here first |

Edits made in the Shopify theme editor are committed back to the connected branch by Shopify —
always `git pull` before working.

## Connect to Shopify (one time)

1. Shopify admin → **Online Store → Themes → Add theme → Connect from GitHub**.
2. Authorize the Shopify GitHub app for this repo only.
3. Pick `QuintenK058/ecom-store`, branch `staging`. Shopify creates an unpublished theme that
   syncs on every push.
4. When ready to launch, connect `main` the same way and publish it.

## Local development

```bash
npm install -g @shopify/cli
shopify theme dev --store <your-store>.myshopify.com
shopify theme check
```

## Docs

Start with `docs/brand.md`. Every unverified claim is in `[brackets]` and listed in
`docs/todo-verify.md`.
