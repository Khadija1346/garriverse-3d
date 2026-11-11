# GARRIVERSE 3D — Production Blueprint

## Product direction
GARRIVERSE is a Nigerian culture and cassava-to-garri farming game. Nigerian farming, processing, local trade, people, architecture and community life are core gameplay—not decorative skins.

## Production architecture
- Client: React + TypeScript + Babylon.js 8; mobile-first input and rendering.
- Game domain: deterministic rules for plots, crop lifecycle, vehicles, processing, inventory, quests and XP.
- Server authority: rewards, inventory changes, quest claims, progression and moderator actions are validated server-side.
- Persistence: PostgreSQL with migrations, transactions and unique idempotency keys.
- Authentication: wallet nonce challenge, signature verification, nonce expiry and one-wallet-per-account policy where approved.
- Operations: structured logs, audit trail, rate limits, schema validation, health checks and automated tests.
- Hosting: Netlify frontend/functions with a managed PostgreSQL provider selected and configured before production launch.

## Gameplay loop
1. Prepare a plot with the correct farm equipment.
2. Plant cassava cuttings.
3. Water and care for the crop over a meaningful growth cycle.
4. Harvest mature cassava using the appropriate tool or harvester.
5. Move cassava by trailer/truck to the processing district.
6. Peel, wash, grate, press/dewater, sieve and fry cassava into garri.
7. Store, transport and sell garri through the market economy.
8. Earn server-validated XP, complete quests and unlock progression.

## Progression and quests
Quest definitions and deterministic XP/level rules are being established in src/game. The client may display progress, but it must never be trusted to award XP. The server must validate the underlying game event, enforce one-time claims and write the event and reward in one database transaction.

## Web3 and community
- Website: https://garri.world/checker
- X: https://x.com/Garrionchain
- Telegram destination currently known: https://t.me/GARRIONCHAIN
- Telegram group: add the confirmed group invite separately from the channel.
- Wallet: implement signed authentication; a typed wallet address is not proof of ownership.
- NFTs: show approved collection metadata and ownership only after chain/network and contract addresses are confirmed. Minting stays disabled until the GARRI team approves the contract and rules.
- Token rewards: no real $GARRI promise, balance or cash-out until the team approves tokenomics, contracts and settlement.

## Nigerian culture requirements
Represent the cassava-to-garri value chain accurately: stem cuttings, farm preparation, weeding and watering, harvesting, peeling, washing, grating, fermentation/dewatering, sieving, frying and packaging. Include a Nigerian village and market setting, locally appropriate tools, clothing, architecture, transport and character interactions. Avoid presenting one region's customs as universal across Nigeria; use region-aware content and cultural review.

## Quality gates before production
- TypeScript typecheck and optimized production build pass.
- Unit tests cover crop state transitions, XP thresholds, quest completion, duplicate claims and inventory boundaries.
- Integration tests prove server-side authorization and persistence.
- Mobile testing covers touch controls, low-memory devices, orientation and performance.
- Security review covers wallet signatures, moderator permissions, rate limits and reward idempotency.
- Deployment is verified on the actual Netlify site before calling the release production-ready.

## Current implementation boundary
The existing src/App.tsx still contains local-only farming state and procedural 3D geometry. That is not production gameplay. This branch begins the production domain foundation; persistent backend, imported/licensed art assets, wallet authentication, NFT contracts and deployment verification remain required work.
