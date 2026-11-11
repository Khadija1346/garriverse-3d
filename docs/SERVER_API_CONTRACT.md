# Server API Contract — GARRIVERSE 3D

All routes are versioned under /api/v1. All authenticated requests require a verified session. The server derives the player identity from the session; it never trusts a client-supplied player ID, XP total, inventory balance, role or quest-completion flag.

## Identity
- POST /auth/wallet/nonce — issue a short-lived, single-use nonce for a wallet address.
- POST /auth/wallet/verify — verify the wallet signature and consume the nonce; return a session.
- POST /auth/logout — revoke the current session.

## Player and progression
- GET /player/me — return persisted profile, XP, level, inventory and unlocked districts.
- GET /player/leaderboard — paginated leaderboard from server-persisted XP.
- GET /quests — return quest definitions and the authenticated player's progress.
- POST /quests/:questId/claim — claim a completed quest. Enforce server-verified objectives, one-time claim rules and an idempotency key in a database transaction.

## Gameplay commands
- POST /farm/plots/:plotId/prepare
- POST /farm/plots/:plotId/plant
- POST /farm/plots/:plotId/water
- POST /farm/plots/:plotId/harvest
- POST /processing/batches — create a processing batch from owned cassava inventory.
- POST /processing/batches/:batchId/advance — advance only the next valid processing stage.
- POST /logistics/deliveries — create a delivery from a server-validated cargo manifest.
- POST /market/orders — create a market order using server-calculated prices and inventory.

Each command validates ownership, state transitions, resource costs, cooldowns, rate limits and idempotency. Inventory and XP updates must be atomic with the gameplay event.

## Community and NFT
- GET /community/links — return approved official website, X, Telegram channel and group URLs.
- GET /wallet/nfts — read approved collection ownership for the supported chain and contract.
- NFT minting and token reward endpoints remain disabled until the GARRI team approves contracts, network, metadata, eligibility and economic rules.

## Moderator operations
- GET /moderation/overview
- POST /moderation/quests
- POST /moderation/announcements
- GET /moderation/audit-log

Every moderator route requires a server-side role check and writes an immutable audit event. Hiding a button in the client is not authorization.

## Required persistence constraints
- Unique wallet address where the one-wallet-per-account rule is approved.
- Unique nonce and unique quest claim per player/quest/season.
- Unique idempotency key per player/action.
- Foreign keys for player-owned plots, inventory, processing batches and deliveries.
- Transactional event, inventory and XP writes.
- UTC timestamps and explicit season identifiers.

## Error contract
Return stable machine-readable codes such as UNAUTHENTICATED, FORBIDDEN, INVALID_STATE, INSUFFICIENT_INVENTORY, QUEST_NOT_COMPLETE, ALREADY_CLAIMED, RATE_LIMITED and CONFLICT. Never return success for an action that was not committed.
