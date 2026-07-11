# Layne Minigames

A small collection of family-friendly browser games. The first game,
**Checkout**, is a pretend cash register with a grocery catalog, cart math, and
optional camera barcode scanning.

## Run locally

Requires Node.js 22.12 or newer.

```bash
npm install
npm run dev
```

Camera access works on `localhost` or over HTTPS. Checkout also includes manual
barcode entry for devices without an available camera.

## Commands

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

## Project layout

- `src/games/checkout/` contains Checkout UI and deterministic game logic.
- `src/App.tsx` is the lightweight minigame hub.
- `public/` contains app metadata and the standalone brand mark.

No account, API, or backend is required.

## License

[MIT](LICENSE)
