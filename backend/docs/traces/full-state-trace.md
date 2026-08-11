# Game State Trace — How `GameContext` Mutates

The state machine keeps **one flat object**, `GameContext`, defined in
[gameMachine.ts](../../../packages/game/src/gameMachine.ts). There is no separate
`GameState`, no `TurnState`, no discard pile, and no turn phase stored in context —
the phase *is* the machine's state node.

This file traces how each field changes, action by action. Every mutation below is a
real `assign` in [actions.ts](../../../packages/game/src/actions.ts). For the matching
socket traffic, see [full-actions-trace.md](./full-actions-trace.md).

## The whole shape

```ts
interface GameContext {
  players: Player[];                       // turn order IS array order
  deck: Deck;                              // index 0 is the top of the draw pile
  currentTurnPlayerId: string | null;
  lastDrawnCard: Card | null;
  lastPlayedCards: Card[] | null;          // most recent play, 1 card or a combo
  countdownEndsAt: number | null;
  turnsCount: number;                      // draws still owed — the wire's attackCount
  isUnderAttack: boolean;
  nopeWindow: NopeWindow | null;
  selectedPlayerId: string | null;         // target of the pending action
  pendingAction: PendingActionType | null;
  givenCard: Card | null;
}

interface Player {
  id: string;
  name: string;
  avatarUrl: string | null;
  hand: Card[];
  isConfirmed: boolean;
  isAlive: boolean;
}

interface NopeWindow {
  cards: Card[];                           // what is being Noped
  lastPlayerId: string;                    // who acted most recently
  nopeCount: number;                       // even = executes, odd = cancelled
  endsAt: number;
}
```

Four things surprise people:

- **There is no discard pile.** A played card is filtered out of the hand and is gone.
  `lastPlayedCards` is the only trace of it, and the next play overwrites that.
- **Turn order is array position.** No `turnOrder` field. Advancing the turn walks
  `players` forward, skipping anyone with `isAlive: false`.
- **An eliminated player keeps their hand.** `explodePlayer` only flips
  `isAlive: false`; the cards stay in the array and simply stop being reachable.
- **`turnsCount` is not a turn counter.** It is the number of draws the current player
  still owes. `1` for a normal turn, `2` after an Attack. There is no turn number in
  context at all.

## Field-by-field: who writes what

| Field | Written by | Cleared by |
|---|---|---|
| `players` | `addPlayer`, `playCard`, `playCombo`, `drawCard`, `defuseExplodingKitten`, `insertKitten`, `explodePlayer`, `passCardBy*` | never |
| `deck` | `shuffleDeck`, `drawCard`, `insertKitten` | never |
| `currentTurnPlayerId` | `changeTurn`, `changeTurnUnderAttack` | never |
| `lastDrawnCard` | `drawCard` | never (overwritten) |
| `lastPlayedCards` | `playCard`, `playCombo`, `defuseExplodingKitten` | set to `null` on an invalid play |
| `turnsCount` | `drawCard` (−1), `skipTurn` (−1), `changeTurn` (=1), `changeTurnUnderAttack` (=2 or +2) | never |
| `isUnderAttack` | `changeTurn` (false), `changeTurnUnderAttack` (true) | never |
| `nopeWindow` | `setNopeWindow`, `addNope` | `clearNopeWindow` |
| `selectedPlayerId` | `selectPlayer` | `clearSelectedPlayer` |
| `pendingAction` | `playCard`, `playCombo` | `clearPendingAction` |
| `givenCard` | `passCardById`, `passCardByIndex`, `passCardByType` | `clearGivenCard` |

Note `playCard` sets `pendingAction` for every card **except** `NOPE` — a Nope is not
itself a pending action, it modifies the one already in flight.

---

## Initial state after the deal

Five players, so: 7 others + 1 Defuse each, and a 16-card deck holding 4 kittens.

```
players: [
  { id: "A", name: "Alice",   isAlive: true, isConfirmed: true, hand: [8 cards] },
  { id: "B", name: "Bob",     isAlive: true, isConfirmed: true, hand: [8 cards] },
  { id: "C", name: "Charlie", isAlive: true, isConfirmed: true, hand: [8 cards] },
  { id: "D", name: "Diana",   isAlive: true, isConfirmed: true, hand: [8 cards] },
  { id: "E", name: "Eve",     isAlive: true, isConfirmed: true, hand: [8 cards] },
]
deck:                 [16 cards, 4 of them EXPLODING_KITTEN]
currentTurnPlayerId:  "A"
lastDrawnCard:        null
lastPlayedCards:      null
countdownEndsAt:      null
turnsCount:           1
isUnderAttack:        false
nopeWindow:           null
selectedPlayerId:     null
pendingAction:        null
givenCard:            null
```

`currentTurnPlayerId` starts as `null` and the first `changeTurn` resolves it to
`players[0]` — `findIndex` returns `-1`, and `(-1 + 1) % 5 === 0`.

---

## Playing a card

`play-card` with See the Future, from A's hand of 8:

```
playCard
  players[A].hand      8 cards → 7 cards        (card 26 filtered out)
  lastPlayedCards      null → [card 26]
  pendingAction        null → SEE_THE_FUTURE

setNopeWindow
  nopeWindow           null → { cards: [card 26],
                                lastPlayerId: "A",
                                nopeCount: 0,
                                endsAt: now + 3000 }
```

If the card is not in the hand, `playCard` returns only `{ lastPlayedCards: null }` —
the hand is untouched and no window opens.

### A Nope, and a counter-Nope

Each Nope is a `playCard` (removing the Nope from the hand, without setting
`pendingAction`) plus an `addNope`:

```
D Nopes:
  players[D].hand      → card 34 filtered out
  nopeWindow           nopeCount 0 → 1, lastPlayerId "D", endsAt reset to now + 3000

A counter-Nopes:
  players[A].hand      → card 31 filtered out
  nopeWindow           nopeCount 1 → 2, lastPlayerId "A", endsAt reset to now + 3000
```

`nopeCount` is the whole mechanism: the `isNoped` guard reads its parity. Even means
the action executes, odd means it is cancelled. `endsAt` moving each time is why a
Nope can always be Noped back.

### The window closing

```
clearNopeWindow
  nopeWindow           { ... } → null
```

The pending effect then runs from `lastPlayedCards` / `pendingAction`, which is why
those two survive the window rather than being cleared with it.

---

## Drawing

```
drawCard
  deck                 splice(0, 1) — index 0 is the top
  players[X].hand      card appended
  lastDrawnCard        null → the drawn card
  turnsCount           n → n − 1
```

The turn does not end here. The machine goes to `CHECKING_REMAINING_TURNS`, and
`turnsCount > 0` keeps the same player going. That single decrement is why an
Exploding Kitten drawn mid-attack still costs one of the owed draws.

### Kitten drawn, then defused

The kitten lands in the hand like any other card first — `drawCard` does not special
case it. Then:

```
defuseExplodingKitten
  players[X].hand      Defuse filtered out (first one found, by type)
  lastPlayedCards      → [the Defuse]

insertKitten
  deck                 splice(position, 0, lastDrawnCard)
                       position clamped to [0, deck.length]
  players[X].hand      lastDrawnCard filtered out by id
```

Two details worth knowing: the position is **clamped, not rejected**, so an
out-of-range index silently becomes the top or the bottom; and the kitten is removed
from the hand by `id`, matching the exact instance that was drawn.

### Kitten drawn with no Defuse

```
explodePlayer
  players[X].isAlive   true → false
```

That is all. The hand is left as it was — `hand` still holds every card the player
had, kitten included. Nothing reads it again, because every lookup filters on
`isAlive`.

---

## Skip and Attack

```
skipTurn                 turnsCount  n → n − 1
changeTurn               turnsCount  → 1        isUnderAttack → false
changeTurnUnderAttack    turnsCount  → isUnderAttack ? turnsCount + 2 : 2
                                                isUnderAttack → true
```

`skipTurn` only runs on the branch where the player owes more than one draw. On a
normal turn the machine emits `TURN_SKIPPED` and goes straight to changing the turn,
so `turnsCount` is untouched and the event reports `1`.

`changeTurnUnderAttack` stacking is the reason a chain of Attacks escalates: an
un-attacked player passes `2`, an already-attacked one passes `turnsCount + 2`.

Both go through `changeTurnState`, which walks forward from the current player and
returns the first with `isAlive: true` — so eliminations close the ring automatically.

---

## Targeted actions: Favor and combos

These are the only actions that span several client events, and they use three fields
that nothing else touches.

```
selectPlayer             selectedPlayerId  null → target id

passCardById             (choose-card-id — Favor, the giver picks)
passCardByIndex          (choose-card-index — two-card combo, blind position)
passCardByType           (choose-card-type — three-card combo, named type)
  players[from].hand     card removed
  players[to].hand       card inserted at a RANDOM index
  givenCard              null → the card
```

All three resolve the same pair: `from` is `selectedPlayerId`, `to` is
`currentTurnPlayerId`. They differ only in how they locate the card — by id, by
position, or by type.

The random insert is deliberate. If the card landed at a predictable index, a
two-card combo's blind pick would leak: the thief would know where their own new card
sits, and by elimination, something about the order of the hand it came from.

`passCardByType` is the one that can find nothing. When the target holds no card of
the named type the machine emits `NO_CARD_OF_REQUESTED_TYPE` instead and no transfer
happens.

Afterwards three cleanups run — `clearPendingAction`, `clearSelectedPlayer`,
`clearGivenCard` — returning `pendingAction`, `selectedPlayerId` and `givenCard` to
`null`.

---

## Shuffle

```
shuffleDeck
  deck                 shuffled copy — context.deck.slice() then shuffle
```

A new array, not an in-place shuffle. Any `SEE_THE_FUTURE_PEEK` a client is holding is
now worthless, which is what `DECK_SHUFFLED` exists to tell them.

---

## Game over

```
explodePlayer            players[X].isAlive → false
```

Then the `IS_ONLY_ONE_PLAYER_LEFT_ALIVE` guard decides between `CHANGING_TURN` and
`GAME_OVER`. The winner is read out of `players` at that point; context has no
`winnerId` field. Anything durable — who won, when the game started and finished —
lives in the database `GameRecord`, not in the machine.

---

## Not in context

Worth stating plainly, because earlier drafts of this document assumed otherwise:

| Not a context field | Where it actually lives |
|---|---|
| `gameId`, `status`, `winnerId`, `createdAt`, `startedAt`, `finishedAt` | the DB `GameRecord` |
| `rules` | the `DEFAULT_GAME_RULES` module constant |
| `phase` / `TurnPhase` | the machine's own state node |
| `turnNumber` | nowhere — nothing counts turns |
| `discardPile` | nowhere — played cards are discarded by being filtered out |
| `turnOrder` | nowhere — order is `players` array position |
