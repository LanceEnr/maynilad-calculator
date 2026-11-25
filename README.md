# Rental bill calculator

Live: https://lanceenr.github.io/maynilad-calculator/

- **Tenant Due**: the tenant's monthly electricity, water and internet. The water rate per cu.m is
  worked out from Maynilad's tariff (bill ÷ cu.m used), or can be typed in manually.
- **Water Split**: splits the Maynilad bill per head between floors, minus the rent submeter.
- **Maynilad Bill**: offline copy of Maynilad's bill calculator. Rates live in `src/maynilad.ts`.

Pushing to `main` builds the site and publishes it to the `gh-pages` branch
(`.github/workflows/deploy.yml`).
