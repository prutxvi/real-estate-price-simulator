# Real Estate Price Simulator (Maths Project)

Area, location, rooms, price — **correlation & multiple regression** with an AI-powered web app.

- **Data:** 21,613 King County (Seattle) home sales, 2014–15. `../data/kc_house_data.csv`
- **Maths:** Pearson correlation, simple vs multiple regression, 70 location dummies, residual diagnostics → `../notebooks/phase1_maths.ipynb`
- **Models:** linear regression + neural net (MLP), trained in `../scripts/train_export.py`, exported as JSON into `lib/models/` and `public/data/`
- **App:** Next.js (App Router) + Tailwind + Recharts + React-Leaflet

## Run locally

```bash
npm install
# optional: LLM-enhanced AI answers
cp .env.local.example .env.local   # add your OpenCode Go key
npm run dev
```

## Deploy

```bash
npm run build
# push to GitHub, import into Vercel — done
```

## Team / guide details
Edit `lib/config.ts` — guide name/photo and group members' names + registration numbers.
