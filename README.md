# Layne Minigames

A small collection of family-friendly browser games. The first game,
**Checkout**, is a pretend cash register with a grocery catalog, cart math, and
optional camera barcode scanning.

## Run locally

Requires Node.js 24.22.2 or newer in the Node 24 line, or Node.js 26.13.0 or newer.

```bash
npm ci
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

Type checking uses TypeScript 7 via `node node_modules/typescript7/bin/tsc`,
while `typescript` remains on version 6 for typescript-eslint compatibility.
Use `npm run typecheck` rather than relying on `node_modules/.bin/tsc`, which
can refer to either installation.
