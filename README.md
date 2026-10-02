# Real Estate Price Simulator

A mathematics project on **correlation & multiple regression** — deployed as a live web app
that prices real Hyderabad properties in Indian rupees, with an AI assistant.

**Live app:** http://localhost:3100 (dev) — deployable to Vercel.

## The maths

- Pearson correlation between price and area, BHK, amenities, locality
- Multiple linear regression (11 features + 48 locality dummies), Ordinary Least Squares
- Model comparison: area-only → + BHK/amenities → + locality → neural net (MLP)
- Holdout results on 2,518 real Hyderabad listings:

| Model | R² | RMSE |
|---|---|---|
| Area only | 0.693 | ₹43.99 L |
| 11 features | 0.709 | ₹42.86 L |
| + 48 localities | **0.775** | ₹37.68 L |
| Neural net | 0.714 | ₹42.46 L |

## Data

- `data/hyderabad_sales.csv` — 2,518 Hyderabad sale listings (asking prices), 40 columns
- `data/hyd_v2.csv` — rental listings used to derive locality coordinates (12 MB)
- `data/hyderabad_clean.csv` — cleaned/feature-engineered dataset used by the models

## Pipeline

```bash
python scripts/prep_hyderabad.py            # clean + coordinates + locality grouping
python scripts/train_export_hyderabad.py    # fit models, export JSON artifacts to web/
python scripts/make_figures_hyderabad.py    # report figures
```

## Web app (`web/`)

Next.js 16 + TypeScript + Tailwind + Recharts + React-Leaflet.

- Simulator with live ₹ prediction, per-feature breakdown, k-NN similar listings,
  and an all-in cost card (stamp duty + registration)
- AI price assistant (OpenCode Go LLM, offline engine fallback)
- Map, correlations, regressions, print-ready report, team page

### Environment

LLM wiring lives in `web/.env.local` (never committed):

```
OPENCODE_GO_API_KEY=...
OPENCODE_GO_BASE_URL=https://opencode.ai/zen/go/v1
OPENCODE_GO_MODEL=glm-5.3-flash
```

Tax percentages for the all-in cost card are in `web/lib/config.ts`.
