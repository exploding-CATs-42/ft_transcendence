# events.ts

## ServerEventType (broadcast — server → all clients)

| Value | Payload | Description |
|---|---|---|
| GAME_STARTED | | Game moved from LOBBY to PLAYING |
| TURN_CHANGED | | New player's turn began |
| CARD_PLAYED | CardPlayedPayload | A single card was played. Nope window opens. Carries actionId and timer expiry |
| COMBO_PLAYED | ComboPlayedPayload | A pair or triple was played. Nope window opens. Carries actionId and timer expiry |
| NOPE_PLAYED | NopePlayedPayload | A Nope was played. Timer resets. Carries new expiry |
| NOPE_WINDOW_RESOLVED | NopeWindowResolvedPayload | Timer expired. `executed: true` = effect happens, `executed: false` = cancelled by Nope |
| CARD_DRAWN | | A player drew a card. Card type is NOT revealed to other players |
| EXPLODING_KITTEN_DRAWN | | A player drew an Exploding Kitten |
| PLAYER_DEFUSED | | A player survived with a Defuse |
| PLAYER_ELIMINATED | | A player exploded and is out |
| KITTEN_INSERTED | | Kitten was reinserted. Position is NOT revealed |
| FAVOR_REQUESTED | | Favor resolved (not Noped), target must give a card |
| FAVOR_RESOLVED | | Target gave a card. Card type revealed to all |
| DECK_SHUFFLED | | Draw pile was shuffled |
| GAME_OVER | | One player remaining. Includes winnerId |

### Communication flow example

A plays See the Future, no one Nopes:
```
Server → All          CARD_PLAYED { playerId, cardType, actionId, nopeWindowExpiresAt }
                      ... timer expires ...
Server → All          NOPE_WINDOW_RESOLVED { actionId, type: SEE_THE_FUTURE, executed: true }
Server → Client A     SEE_THE_FUTURE_PEEK { cards }
```

A plays Skip, B Nopes it:
```
Server → All          CARD_PLAYED { playerId, cardType, actionId, nopeWindowExpiresAt }
Server → All          NOPE_PLAYED { playerId: B, actionId, nopeWindowExpiresAt }
                      ... timer expires ...
Server → All          NOPE_WINDOW_RESOLVED { actionId, type: SKIP, executed: false }
```

## Broadcast Payload Interfaces

### CardPlayedPayload

Sent with CARD_PLAYED. Opens a Nope window.

| Field | Description |
|---|---|
| playerId | Who played the card |
| cardType | The type of card played |
| actionId | UUID linking to the PendingAction |
| nopeWindowExpiresAt | Epoch ms — when the Nope window auto-resolves |

### ComboPlayedPayload

Sent with COMBO_PLAYED. Opens a Nope window.

| Field | Description |
|---|---|
| playerId | Who played the combo |
| cardTypes | The card type used in the combo |
| cardCount | 2 for pair, 3 for triple |
| targetPlayerId | Who is being stolen from |
| actionId | UUID linking to the PendingAction |
| nopeWindowExpiresAt | Epoch ms — when the Nope window auto-resolves |

### NopePlayedPayload

Sent with NOPE_PLAYED. Resets the timer.

| Field | Description |
|---|---|
| playerId | Who played the Nope |
| actionId | UUID of the PendingAction being contested |
| nopeWindowExpiresAt | New epoch ms — timer was reset |

### NopeWindowResolvedPayload

Sent with NOPE_WINDOW_RESOLVED. The window has closed.

| Field | Description |
|---|---|
| actionId | UUID of the PendingAction that was resolved |
| type | PendingActionType — what kind of action it was |
| executed | `true` = effect happens (isNoped was false). `false` = cancelled (isNoped was true) |

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

## Private Payload Interfaces

| Interface | Fields | Notes |
|---|---|---|
| YourHandPayload | `hand: CardInstance[]` | Full hand contents |
| CardReceivedPayload | `card: CardInstance`, `fromId: string \| null` | `null` = drawn from deck, `playerId` = received via Favor or combo |
| CardRemovedPayload | `cardInstanceId: string`, `reason: CardRemovalReason` | |
| SeeTheFuturePeekPayload | `cards: CardInstance[]` | Top N cards where N = `rules.seeTheFutureCount`. Index 0 = next drawn |
| InsertKittenPromptPayload | `deckSize: number` | Valid positions: 0 (top) through deckSize (bottom) |
| FavorMustGivePayload | `requesterId: string`, `requesterName: string` | |