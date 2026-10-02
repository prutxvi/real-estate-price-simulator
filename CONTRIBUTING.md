# Contributing

Thanks for taking the time to contribute! This is a mathematics project turned open-source — all levels of help are welcome.

## Getting started

1. Fork the repository and clone it locally.
2. Set up the Python environment and the web app (see the [README](README.md#quickstart)).
3. Create a branch: `git checkout -b feat/your-feature`.

## Development workflow

- **Data & models** live in `scripts/`. Rerun the full pipeline and commit updated artifacts when you change data or the model:

  ```bash
  python scripts/prep_hyderabad.py
  python scripts/train_export_hyderabad.py
  python scripts/make_figures_hyderabad.py
  ```

- **Web app** lives in `web/`. Keep the TypeScript build green:

  ```bash
  cd web && npm ci && npm run build
  ```

- **Never commit secrets.** `web/.env.local` is git-ignored; document any new env var in `web/.env.example` instead.

## Pull request checklist

- [ ] Pipeline reruns cleanly (or the change is web-only and `npm run build` passes)
- [ ] No `.env.local` or credentials in the diff
- [ ] README updated if behaviour or setup changed
- [ ] `CHANGELOG.md` entry added under "Unreleased"

## Code of conduct

Be respectful. This project is a student work that welcomes constructive criticism — prefer questions over assumptions.
