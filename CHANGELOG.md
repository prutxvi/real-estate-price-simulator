# Changelog

## [1.1.0] - 2026-10-02

### Added
- Hyderabad relaunch: 2,518 real Hyderabad listings replace the King County dataset.
- Indian-rupee pricing throughout (₹ Lakh / Crore formatting, ₹ per sq ft).
- All-in cost card with Telangana stamp duty (4%) + registration (1%) estimates.
- Indian-reality feature set: carpet area, BHK, new/resale, pool, gym, club house,
  24×7 security, power backup, covered parking, lift, Vaastu compliance.
- 48 named localities (Banjara Hills, Jubilee Hills, Hitech City, Gachibowli, ...).
- Interactive Hyderabad map on OpenStreetMap tiles.

### Fixed
- Map page appeared empty because the price filter defaulted to the dataset minimum; now defaults to ₹2.5 Cr (~94% of listings).
- MLP forward pass transposed sklearn layer weights (NaN predictions).
- Linear prediction double-counted the mean shift (~₹10 L inflation per estimate).

### Changed
- Simulator and AI assistant retrained on Hyderabad data:
  area-only R² 0.693 → +BHK/amenities 0.709 → +48 localities **0.775** (RMSE ₹37.68 L); MLP R² 0.714.
- Light/dark theme switch, redesigned landing page and chat UI.

## [1.0.0] - 2026-10-01

- Initial release: King County (Seattle) real estate price simulator with correlation analysis,
  multiple regression, neural-net comparison, AI assistant, map, and print-ready report.
