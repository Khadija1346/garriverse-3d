# GARRIVERSE 3D — Isometric Farm Tycoon

A mobile-first, isometric 3D farming game built around the GARRI ecosystem.

## Current milestone

The first milestone is a playable browser prototype:
- Babylon.js 3D scene with an isometric-style camera
- Four interactive cassava plots
- Plant, grow, and harvest gameplay
- Local prototype inventory and XP feedback
- Responsive controls for mobile and desktop

## Planned districts

1. Farm District — prepare plots, plant cassava, water and harvest
2. Water District — wells, tanks and irrigation
3. Processing District — turn harvested cassava into garri
4. Warehouse — manage stored resources
5. Garri Market — future market and approved ecosystem integrations

## Planned platform integrations

- Wallet linking using nonce-based signature verification
- Server-authoritative player state, inventory, XP and quest claims
- Quests, achievements and leaderboard
- Moderator Office with server-side role checks and audit logs
- DAO embedding bridge and community links
- NFT support only after the GARRI team approves the contracts and product rules

## Important economy boundary

The current prototype does **not** issue real $GARRI, transferable tokens, NFTs, cash-outs or on-chain rewards. Client-side XP and inventory are prototype-only. Production gameplay must be validated and persisted by a trusted backend before any rewards are represented as real.

## Stack

- React + TypeScript + Vite
- Babylon.js
- Planned backend: Netlify Functions, PostgreSQL and Drizzle ORM
- Planned validation/testing: Zod, Vitest and Playwright

## Run locally

```bash
npm install
npm run dev
```

## Project status

Early prototype foundation. See the repository commits for implemented functionality.