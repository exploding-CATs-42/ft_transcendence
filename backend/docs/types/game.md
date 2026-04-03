# game.ts

## GameStatus

| Value | Description |
|---|---|
| LOBBY | Waiting for players to join, 2–5 required |
| PLAYING | Game in progress |
| FINISHED | One player remaining, game over |

## GameRules

Shape of `rules.json`. Loaded at startup, snapshotted into `GameState.rules` when a game starts. Immutable mid-game.

| Field | Default | Description |
|---|---|---|
| dealtCardsPerPlayer | 7 | Random cards dealt from the shuffled deck per player |
| defusesDealtPerPlayer | 1 | Defuses dealt separately (not from the deck) per player |
| maxDefusesShuffledBack | 2 | Cap on leftover defuses shuffled back into the deck. |
| totalDefuses | 6 | Total defuse cards in the full deck. |
| seeTheFutureCount | 3 | How many cards to peek from top of deck |
| minPlayers | 2 | Minimum players to start |
| maxPlayers | 5 | Maximum players allowed |
| fasterVariantRemoveFraction | 0.33 | Fraction of deck removed in 2–3 player faster variant |
| nopeWindowMs | 3000 | Nope reaction window duration in ms. Resets to full duration after each Nope |

## Deck

| Field | Description |
|---|---|
| drawPile | Array of CardInstance. Index 0 = top (next to be drawn). |
| discardPile | Array of CardInstance. Index 0 = most recently discarded. |

## Player

| Field | Description |
|---|---|
| playerId | Unique identifier for this player |
| displayName | Name shown in UI |
| hand | Array of CardInstance — private, never broadcast |
| isAlive | `false` when eliminated by Exploding Kitten without Defuse |
| turnOrder | 0-based stable seat index assigned at game start. Never changes. Dead players are skipped, not reindexed. Used by "find next alive player" logic |

## GameState

Single source of truth for one game session. Never broadcast raw — always derive `PublicGameView` before sending.

| Field | Description |
|---|---|
| gameId | Unique identifier for this game |
| status | GameStatus (LOBBY → PLAYING → FINISHED) |
| players | All players including eliminated ones (`isAlive: false`) |
| deck | Draw pile and discard pile |
| turn | Current TurnState |
| winnerId | Set when status becomes FINISHED |
| rules | Snapshot of GameRules taken at game start |
| createdAt | Epoch ms — when the game was created |
| startedAt | Epoch ms — when the host started the game. |
| finishedAt | Epoch ms — when the game ended. |
