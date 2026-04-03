# events.ts

## ServerEventType (broadcast — server → all clients)

| Value | Description |
|---|---|
| GAME_STARTED | Game moved from LOBBY to PLAYING |
| TURN_CHANGED | New player's turn began |
| CARD_PLAYED | A single card was played (card goes to discard) |
| COMBO_PLAYED | A pair or triple was played (cards go to discard) |
| NOPE_PLAYED | A Nope was played. Timer resets. Payload includes new `nopeWindowExpiresAt` |
| NOPE_WINDOW_OPENED | Timer started for a pending action. Payload includes `nopeWindowExpiresAt` |
| NOPE_WINDOW_CLOSED | Timer expired. Action either resolved or was cancelled |
| ACTION_RESOLVED | Pending action executed (`isNoped` was false) |
| ACTION_CANCELLED | Pending action voided (`isNoped` was true) |
| CARD_DRAWN | A player drew a card. Card type is NOT revealed to other players |
| EXPLODING_KITTEN_DRAWN | A player drew an Exploding Kitten |
| PLAYER_DEFUSED | A player survived with a Defuse |
| PLAYER_ELIMINATED | A player exploded and is out |
| KITTEN_INSERTED | Kitten was reinserted. Position is NOT revealed |
| FAVOR_REQUESTED | Favor resolved (not Noped), target must give a card |
| FAVOR_RESOLVED | Target gave a card. Card type revealed to all |
| DECK_SHUFFLED | Draw pile was shuffled |
| PHASE_CHANGED | Turn phase changed |
| GAME_OVER | One player remaining. Includes winnerId |

## Public View Interfaces

Filtered projections of server state — secrets stripped before broadcasting.

### PublicGameView

What all clients see.

| Field | Description |
|---|---|
| gameId | Game identifier |
| status | GameStatus |
| turn | PublicTurnView |
| players | Array of PublicPlayerView |
| deckSize | Card count only — order is secret |
| discardPileTop | Most recently discarded card, or null |
| winnerId | Set when game is over |

### PublicTurnView

Masked turn state.

| Field | Description |
|---|---|
| currentPlayerId | Whose turn it is |
| phase | Current TurnPhase |
| attackCount | Draws owed |
| isUnderAttack | Whether this turn was caused by Attack |
| pendingAction | PendingAction or null. Cards on discard are already visible |
| nopeChain | NopeChain or null |
| favorState | FavorState or null |
| turnNumber | Turn counter |

### PublicPlayerView

What others see about a player.

| Field | Source | Secret stripped |
|---|---|---|
| playerId | Player.playerId | — |
| displayName | Player.displayName | — |
| handSize | `Player.hand.length` | Individual cards hidden |
| isAlive | Player.isAlive | — |
| turnOrder | Player.turnOrder | — |

## PrivateEventType (server → one client)

| Value | Payload | Description |
|---|---|---|
| YOUR_HAND | YourHandPayload | Full hand contents on join |
| CARD_RECEIVED | CardReceivedPayload | One card added to your hand |
| CARD_REMOVED | CardRemovedPayload | One card removed from your hand |
| SEE_THE_FUTURE_PEEK | SeeTheFuturePeekPayload | Top N cards of deck (private) |
| DEFUSE_PROMPT | (no payload) | You drew a kitten — play Defuse or die |
| INSERT_KITTEN_PROMPT | InsertKittenPromptPayload | Choose where to reinsert |
| FAVOR_MUST_GIVE | FavorMustGivePayload | You must give one card to requester |

## CardRemovalReason

| Value | When used |
|---|---|
| PLAYED | Player played a card from their hand |
| STOLEN | Card taken by a combo (pair or triple) |
| GIVEN_AWAY | Card given via Favor |
| EXPLODED | Entire hand discarded on elimination |

## Payload Interfaces

| Interface | Fields | Notes |
|---|---|---|
| YourHandPayload | `hand: CardInstance[]` | Full hand contents |
| CardReceivedPayload | `card: CardInstance`, `fromId: string \| null` | `null` = drawn from deck, `playerId` = received via Favor or combo |
| CardRemovedPayload | `cardInstanceId: string`, `reason: CardRemovalReason` | |
| SeeTheFuturePeekPayload | `cards: CardInstance[]` | Top N cards where N = `rules.seeTheFutureCount`. Index 0 = next drawn |
| InsertKittenPromptPayload | `deckSize: number` | Valid positions: 0 (top) through deckSize (bottom) |
| FavorMustGivePayload | `requesterId: string`, `requesterName: string` | |
