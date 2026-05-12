# Ledger

A private, on-device personal wealth tracker. Every asset and liability in one place — bank accounts, credit cards, loans, mutual funds, NPS, stocks, crypto, real estate, gold, cash.

**All data stored locally in `localStorage`. Nothing leaves the device.**

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build
npm run preview
```

## Project layout

```
src/
  main.jsx                 React entry
  App.jsx                  Top-level shell, routing, state
  styles/global.css        Design tokens (CSS vars), base styles, grain overlay
  lib/
    accountTypes.js        Registry of account kinds + per-type form schemas
    storage.js             localStorage adapter
    format.js              INR formatter (Lakh/Crore), date helpers
  icons/
    Icon.jsx               SVG icon primitive + icon registry
  components/
    TopBar.jsx
    Footer.jsx
    ModalShell.jsx
    AccountRow.jsx
    AccountModal.jsx
    TypePicker.jsx
    Field.jsx
    StatCard.jsx
    SectionHeader.jsx
    Composition.jsx
    EmptyState.jsx
    ComingSoonCard.jsx
  views/
    Dashboard.jsx
    AccountsView.jsx
    ImportView.jsx
```

## Adding a new account type

1. Add an entry to `ACCOUNT_TYPES` in `src/lib/accountTypes.js` (label, icon key, asset/liability, accent color).
2. Add a field schema to `FIELD_SCHEMAS` in the same file.
3. If the icon doesn't exist yet, add it to the `Icons` map in `src/icons/Icon.jsx`.

That's it — the type picker, form modal, dashboard composition and accounts list all pick it up automatically.

## Roadmap

- CAS PDF parsing (CAMS / KFintech / CDSL) — UI scaffolded in Import view, parser pending.
- Email-driven import (Gmail / iCloud) — read statements directly.
- iOS app via React Native + Expo, reusing the schemas and styles.
