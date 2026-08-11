# Full Game Trace — 5 Players, All Card Types

A complete game traced at the socket level, from the deal to a winner. Every line is
a real event from `@exploding-cats/contracts`, with the payload shape it actually
carries. Use this alongside [the socket spec](../sockets/asyncapi.yaml); this file
shows the *ordering*, the spec shows the field-by-field schemas.

## How to read this

```
A → server        client event, always carrying gameId
server → A        private emit, to that player's sockets only
server → ¬A       public emit, to the room except that player
server → all      public emit, to the whole room
                  plain text is commentary, not traffic
```

Two things worth knowing before the first turn:

- **Cards are numeric ids, not strings.** A card is `{ id, type, name, ... }` and the
  wire only ever carries `cardId: number`. Ids are assigned once at deck creation by
  walking `cards.json` in order, so they are grouped by type:

  | Type | ids | | Type | ids |
  |---|---|---|---|---|
  | `EXPLODING_KITTEN` | 0–3 | | `NOPE` | 31–35 |
  | `DEFUSE` | 4–9 | | `TACOCAT` | 36–39 |
  | `ATTACK` | 10–13 | | `HAIRY_POTATO_CAT` | 40–43 |
  | `SKIP` | 14–17 | | `BEARD_CAT` | 44–47 |
  | `FAVOR` | 18–21 | | `CATTERMELON` | 48–51 |
  | `SHUFFLE` | 22–25 | | `RAINBOW_RALPHING_CAT` | 52–55 |
  | `SEE_THE_FUTURE` | 26–30 | | | |

  56 cards, ids 0–55 — which is exactly why every `cardId` schema is
  `min(0).max(55)`.

- **`attackCount` on the wire is the number of draws the current player still owes.**
  Internally it is `turnsCount`. A normal turn is `1`. Drawing decrements it; the turn
  ends when it reaches `0`. Attack sets it to `2`, or adds `2` to an existing attack.

The Nope window is `NOPE_WINDOW_MS` = **3000 ms**.

## Setup

```
Players: A, B, C, D, E (turnOrder 0–4)

56-card deck splits into 4 Exploding Kittens, 6 Defuses, 46 others.
Deal 7 others + 1 Defuse each = 8 cards per player (35 others + 5 Defuses).
Deck = 11 remaining others + 1 Defuse shuffled back + 4 Kittens = 16 cards.
```

Starting hands:

```
A: 4 Defuse | 14 Skip, 26 See the Future, 31 Nope, 36 Tacocat, 44/45/46 Beard Cat
B: 5 Defuse | 10 Attack, 22 Shuffle, 32 Nope, 40 Hairy Potato, 49/50/51 Cattermelon
C: 6 Defuse | 15 Skip, 18 Favor, 27 See the Future, 33 Nope, 48 Cattermelon, 52/53 Rainbow-Ralphing
D: 7 Defuse | 11 Attack, 19 Favor, 23 Shuffle, 28 See the Future, 34 Nope, 38 Tacocat, 41 Hairy Potato
E: 8 Defuse | 12 Attack, 16 Skip, 20 Favor, 37 Tacocat, 42 Hairy Potato, 47 Beard Cat, 54 Rainbow-Ralphing
```

Deck, top first — fixed here so the trace is reproducible:

```
0(EK) 24 13 29 1(EK) 9 17 21 39 2(EK) 25 43 30 55 35 3(EK)
```

---

## Turn 1 — A · `attackCount: 1`

> A peeks, sees a kitten on top, and Skips instead of drawing.

```
A → server        play-card { gameId, cardId: 26 }
server → A        card-removed { cardId: 26, reason: PLAYED }
server → ¬A       card-played { playerId: A, cardType: SEE_THE_FUTURE,
                                nopeWindowExpiresAt: t+3000 }

                  ... 3000 ms, nobody Nopes ...

server → all      NOPE_WINDOW_RESOLVED                       (no payload)
server → A        SEE_THE_FUTURE_PEEK { playerId: A, cards: [0, 24, 13] }
server → ¬A       player-looks-at-the-future                 (no payload)

A → server        seen-the-future { gameId }
server → ¬A       PLAYER_SAW_THE_FUTURE                      (no payload)

                  A saw kitten 0 on top. Skip costs a card but avoids it.

A → server        play-card { gameId, cardId: 14 }
server → A        card-removed { cardId: 14, reason: PLAYED }
server → ¬A       card-played { playerId: A, cardType: SKIP, nopeWindowExpiresAt: t+3000 }

                  ... 3000 ms ...

server → all      NOPE_WINDOW_RESOLVED
server → all      TURN_SKIPPED  { playerId: A, attackCount: 1 }
server → all      TURN_CHANGED  { playerId: B, attackCount: 1 }
```

`attackCount` is still `1` in `TURN_SKIPPED`. On a normal turn Skip does not decrement
it — the machine goes straight to changing the turn. The decrement only happens when
the player owes more than one draw, which Turn 12 shows.

**Deck 16 · kittens 4** · A holds 4, 31, 36, 44, 45, 46

---

## Turn 2 — B · `attackCount: 1`

> A three-card combo naming a type the target does hold, then a defused kitten.

```
B → server        play-combo { gameId, cardIds: [49, 50, 51] }
server → B        card-removed { cardId: 49, reason: PLAYED }
server → B        card-removed { cardId: 50, reason: PLAYED }
server → B        card-removed { cardId: 51, reason: PLAYED }
server → ¬B       COMBO_PLAYED { playerId: B,
                                 cardTypes: [CATTERMELON, CATTERMELON, CATTERMELON],
                                 nopeWindowExpiresAt: t+3000 }

                  ... 3000 ms ...

server → all      NOPE_WINDOW_RESOLVED
server → all      WAITING_FOR_PLAYER_SELECTION               (no payload)

B → server        select-player { gameId, playerId: C }
server → all      PLAYER_SELECTED { playerId: C }
server → all      WAITING_FOR_CARD_TYPE_SELECTION { targetPlayerId: C }

B → server        choose-card-type { gameId, cardType: NOPE }

                  C holds Nope 33, so the demand is satisfied.

server → C        card-removed  { cardId: 33, reason: STOLEN }
server → B        card-received { card: { id: 33, type: NOPE, ... },
                                  reason: CAT_TRIPLE, playerIdFrom: C }
server → all      CARD_STOLEN   { playerIdFrom: C, playerIdTo: B, cardType: NOPE }
```

`CARD_STOLEN` carries `cardType` here because a three-card combo names the type out
loud — it was already public. Turn 8 shows the two-card case, where it is withheld.

The combo did not end the turn; B still owes its draw.

```
B → server        draw-card { gameId }

                  Kitten 0 is still on top — A skipped past it.

server → all      EXPLODING_KITTEN_DRAWN { kittensInDeck: 3 }
server → B        DEFUSE_PROMPT { playerId: B, endsAt: t+..., canDefuse: true }

B → server        play-defuse { gameId }
server → B        card-removed { cardId: 5, reason: PLAYED }
server → all      PLAYER_DEFUSED { playerId: B, deckSize: 15 }

                  No prompt is emitted for the insertion. The player who just defused
                  drives it from their own client; everyone else learns the outcome.

B → server        insert-kitten { gameId, explodingKittenPosition: 13 }
server → all      KITTEN_INSERTED { playerId: B, cardId: 0, kittensInDeck: 4 }

                  The chosen position is never revealed — only that it happened.
                  Drawing the kitten already consumed B's draw, so the turn ends.

server → all      TURN_CHANGED { playerId: C, attackCount: 1 }
```

**Deck 16 · kittens 4** · B holds 10, 22, 32, 33, 40 · C holds 6, 15, 18, 27, 48, 52, 53

Deck is now `24 13 29 1 9 17 21 39 2 25 43 30 55 0 35 3`.

---

## Turn 3 — C · `attackCount: 1`

> A Nope and a counter-Nope cancel out, so the Favor goes through.

```
C → server        play-card { gameId, cardId: 18 }
server → C        card-removed { cardId: 18, reason: PLAYED }
server → ¬C       card-played { playerId: C, cardType: FAVOR, nopeWindowExpiresAt: t+3000 }

                  D does not want to give anything up.

D → server        play-nope { gameId, cardId: 34 }
server → D        card-removed { cardId: 34, reason: PLAYED }
server → ¬D       NOPE_PLAYED { playerId: D, nopeWindowExpiresAt: t+3000 }

                  Each Nope restarts the window, so a Nope can itself be Noped.
                  A has no stake in this but does not want D setting the precedent.

A → server        play-nope { gameId, cardId: 31 }
server → A        card-removed { cardId: 31, reason: PLAYED }
server → ¬A       NOPE_PLAYED { playerId: A, nopeWindowExpiresAt: t+3000 }

                  ... 3000 ms ...

                  Two Nopes: the second cancels the first, so the Favor executes.

server → all      NOPE_WINDOW_RESOLVED
server → all      WAITING_FOR_PLAYER_SELECTION

C → server        select-player { gameId, playerId: D }
server → all      PLAYER_SELECTED { playerId: D }
server → all      WAITING_FOR_FAVOR_CARD_SELECTION { playerId: D }

                  Favor lets the *giver* choose. D gives up its See the Future.

D → server        choose-card-id { gameId, cardId: 28 }
server → D        card-removed  { cardId: 28, reason: GIVEN_AWAY }
server → C        card-received { card: { id: 28, type: SEE_THE_FUTURE, ... },
                                  reason: FAVOR, playerIdFrom: D }
server → all      CARD_GIVEN    { playerIdFrom: D, playerIdTo: C }

C → server        draw-card { gameId }
server → C        card-received { card: { id: 24, type: SHUFFLE, ... }, reason: DRAW }
server → all      card-drawn { playerId: C }
server → all      TURN_CHANGED { playerId: D, attackCount: 1 }
```

`CARD_GIVEN` names both players but never the card. Only the two of them learn what
moved, through the private `card-removed` / `card-received` pair.

**Deck 15 · kittens 4** · A holds 4, 36, 44, 45, 46 · D holds 7, 11, 19, 23, 38, 41

---

## Turn 4 — D · `attackCount: 1`

> Attack ends the turn without drawing and hands the next player two draws.

```
D → server        play-card { gameId, cardId: 11 }
server → D        card-removed { cardId: 11, reason: PLAYED }
server → ¬D       card-played { playerId: D, cardType: ATTACK, nopeWindowExpiresAt: t+3000 }

                  ... 3000 ms ...

server → all      NOPE_WINDOW_RESOLVED
server → all      TURN_CHANGED { playerId: E, attackCount: 2 }
```

**Deck 15 · kittens 4** · D holds 7, 19, 23, 38, 41

---

## Turn 5 — E · `attackCount: 2`

> Attacking back stacks instead of resetting.

```
E → server        play-card { gameId, cardId: 12 }
server → E        card-removed { cardId: 12, reason: PLAYED }
server → ¬E       card-played { playerId: E, cardType: ATTACK, nopeWindowExpiresAt: t+3000 }

                  ... 3000 ms ...

server → all      NOPE_WINDOW_RESOLVED
server → all      TURN_CHANGED { playerId: A, attackCount: 4 }
```

E was already under attack owing 2, so its own Attack adds 2 rather than replacing:
`2 + 2 = 4`. A now owes four draws.

**Deck 15 · kittens 4** · E holds 8, 16, 20, 37, 42, 47, 54

---

## Turn 6 — A · `attackCount: 4`

> A three-card combo naming a type the target does *not* hold, then four draws.

```
A → server        play-combo { gameId, cardIds: [44, 45, 46] }
server → A        card-removed { cardId: 44, reason: PLAYED }
server → A        card-removed { cardId: 45, reason: PLAYED }
server → A        card-removed { cardId: 46, reason: PLAYED }
server → ¬A       COMBO_PLAYED { playerId: A,
                                 cardTypes: [BEARD_CAT, BEARD_CAT, BEARD_CAT],
                                 nopeWindowExpiresAt: t+3000 }

                  ... 3000 ms ...

server → all      NOPE_WINDOW_RESOLVED
server → all      WAITING_FOR_PLAYER_SELECTION

A → server        select-player { gameId, playerId: E }
server → all      PLAYER_SELECTED { playerId: E }
server → all      WAITING_FOR_CARD_TYPE_SELECTION { targetPlayerId: E }

A → server        choose-card-type { gameId, cardType: CATTERMELON }

                  E holds no Cattermelon. Nothing changes hands.

server → all      NO_CARD_OF_REQUESTED_TYPE { cardType: CATTERMELON, targetPlayerId: E }
```

A guessed wrong and spent three cards for nothing. The turn continues — A still owes
four draws.

```
A → server        draw-card { gameId }
server → A        card-received { card: { id: 13, type: ATTACK, ... }, reason: DRAW }
server → all      card-drawn { playerId: A }

                  attackCount 4 → 3, still above zero, so A keeps the turn.

A → server        draw-card { gameId }
server → A        card-received { card: { id: 29, type: SEE_THE_FUTURE, ... }, reason: DRAW }
server → all      card-drawn { playerId: A }

                  attackCount 3 → 2.

A → server        draw-card { gameId }

                  Kitten. attackCount 2 → 1.

server → all      EXPLODING_KITTEN_DRAWN { kittensInDeck: 3 }
server → A        DEFUSE_PROMPT { playerId: A, endsAt: t+..., canDefuse: true }

A → server        play-defuse { gameId }
server → A        card-removed { cardId: 4, reason: PLAYED }
server → all      PLAYER_DEFUSED { playerId: A, deckSize: 12 }

A → server        insert-kitten { gameId, explodingKittenPosition: 3 }
server → all      KITTEN_INSERTED { playerId: A, cardId: 1, kittensInDeck: 4 }

                  attackCount is still 1, so A owes one more draw.

A → server        draw-card { gameId }
server → A        card-received { card: { id: 9, type: DEFUSE, ... }, reason: DRAW }
server → all      card-drawn { playerId: A }

                  attackCount 1 → 0.

server → all      TURN_CHANGED { playerId: B, attackCount: 1 }
```

**Deck 12 · kittens 4** · A holds 9, 13, 29, 36

Deck is now `17 21 1 39 2 25 43 30 55 0 35 3`.

---

## Turn 7 — B · `attackCount: 1`

> Shuffle, then the first elimination.

```
B → server        play-card { gameId, cardId: 22 }
server → B        card-removed { cardId: 22, reason: PLAYED }
server → ¬B       card-played { playerId: B, cardType: SHUFFLE, nopeWindowExpiresAt: t+3000 }

                  ... 3000 ms ...

server → all      NOPE_WINDOW_RESOLVED
server → all      DECK_SHUFFLED                              (no payload)

                  Any peeked knowledge is now stale. Say the deck lands as
                  2 17 55 1 39 25 21 43 3 30 0 35.

B → server        draw-card { gameId }
server → all      EXPLODING_KITTEN_DRAWN { kittensInDeck: 3 }
server → B        DEFUSE_PROMPT { playerId: B, endsAt: t+..., canDefuse: false }
```

`canDefuse: false` — B spent its only Defuse on Turn 2. The prompt is still sent, so
the client can show the player exploding rather than silently killing them.

```
server → all      PLAYER_ELIMINATED { playerId: B, kittensInDeck: 3 }

                  Four players remain, so the game continues. Turn order now
                  skips B: A → C → D → E.

server → all      TURN_CHANGED { playerId: C, attackCount: 1 }
```

**Deck 11 · kittens 3** · alive: A, C, D, E

---

## Turn 8 — C · `attackCount: 1`

> A two-card combo — a blind pick, and the one case where the stolen type stays secret.

```
C → server        play-combo { gameId, cardIds: [52, 53] }
server → C        card-removed { cardId: 52, reason: PLAYED }
server → C        card-removed { cardId: 53, reason: PLAYED }
server → ¬C       COMBO_PLAYED { playerId: C,
                                 cardTypes: [RAINBOW_RALPHING_CAT, RAINBOW_RALPHING_CAT],
                                 nopeWindowExpiresAt: t+3000 }

                  ... 3000 ms ...

server → all      NOPE_WINDOW_RESOLVED
server → all      WAITING_FOR_PLAYER_SELECTION

C → server        select-player { gameId, playerId: D }
server → all      PLAYER_SELECTED { playerId: D }
server → all      WAITING_FOR_RANDOM_CARD_SELECTION { targetPlayerId: D }

                  A two-card combo takes a card by position, not by name. C is
                  picking blind out of D's four cards.

C → server        choose-card-index { gameId, cardIndex: 2 }
server → D        card-removed  { cardId: 23, reason: STOLEN }
server → C        card-received { card: { id: 23, type: SHUFFLE, ... },
                                  reason: CAT_PAIR, playerIdFrom: D }
server → all      CARD_STOLEN   { playerIdFrom: D, playerIdTo: C }

                  No cardType. Revealing it would leak what C is not entitled to
                  know — compare Turn 2, where the type was named up front.

C → server        draw-card { gameId }
server → C        card-received { card: { id: 17, type: SKIP, ... }, reason: DRAW }
server → all      card-drawn { playerId: C }
server → all      TURN_CHANGED { playerId: D, attackCount: 1 }
```

**Deck 10 · kittens 3** · C holds 6, 15, 17, 23, 24, 27, 28, 48 · D holds 7, 19, 38, 41

---

## Turn 9 — D · `attackCount: 1`

> The minimal turn: draw and pass.

```
D → server        draw-card { gameId }
server → D        card-received { card: { id: 55, type: RAINBOW_RALPHING_CAT, ... },
                                  reason: DRAW }
server → all      card-drawn { playerId: D }
server → all      TURN_CHANGED { playerId: E, attackCount: 1 }
```

**Deck 9 · kittens 3**

---

## Turn 10 — E · `attackCount: 1`

```
E → server        play-card { gameId, cardId: 16 }
server → E        card-removed { cardId: 16, reason: PLAYED }
server → ¬E       card-played { playerId: E, cardType: SKIP, nopeWindowExpiresAt: t+3000 }

                  ... 3000 ms ...

server → all      NOPE_WINDOW_RESOLVED
server → all      TURN_SKIPPED { playerId: E, attackCount: 1 }
server → all      TURN_CHANGED { playerId: A, attackCount: 1 }
```

**Deck 9 · kittens 3** · E holds 8, 20, 37, 42, 47, 54

---

## Turn 11 — A · `attackCount: 1`

> Peek, then dodge with Attack instead of Skip.

```
A → server        play-card { gameId, cardId: 29 }
server → A        card-removed { cardId: 29, reason: PLAYED }
server → ¬A       card-played { playerId: A, cardType: SEE_THE_FUTURE,
                                nopeWindowExpiresAt: t+3000 }

                  ... 3000 ms ...

server → all      NOPE_WINDOW_RESOLVED
server → A        SEE_THE_FUTURE_PEEK { playerId: A, cards: [1, 39, 25] }
server → ¬A       player-looks-at-the-future

A → server        seen-the-future { gameId }
server → ¬A       PLAYER_SAW_THE_FUTURE

                  Kitten 1 on top and no Skip in hand. Attack also ends the turn
                  without drawing — and dumps two draws on C.

A → server        play-card { gameId, cardId: 13 }
server → A        card-removed { cardId: 13, reason: PLAYED }
server → ¬A       card-played { playerId: A, cardType: ATTACK, nopeWindowExpiresAt: t+3000 }

                  ... 3000 ms ...

server → all      NOPE_WINDOW_RESOLVED
server → all      TURN_CHANGED { playerId: C, attackCount: 2 }
```

**Deck 9 · kittens 3** · A holds 9, 36

---

## Turn 12 — C · `attackCount: 2`

> Skip while owing more than one draw — the branch that *does* decrement.

```
C → server        draw-card { gameId }

                  The kitten A saw coming. attackCount 2 → 1.

server → all      EXPLODING_KITTEN_DRAWN { kittensInDeck: 2 }
server → C        DEFUSE_PROMPT { playerId: C, endsAt: t+..., canDefuse: true }

C → server        play-defuse { gameId }
server → C        card-removed { cardId: 6, reason: PLAYED }
server → all      PLAYER_DEFUSED { playerId: C, deckSize: 8 }

C → server        insert-kitten { gameId, explodingKittenPosition: 8 }
server → all      KITTEN_INSERTED { playerId: C, cardId: 1, kittensInDeck: 3 }

                  attackCount is 1, so C still owes a draw — and would rather not.

C → server        play-card { gameId, cardId: 17 }
server → C        card-removed { cardId: 17, reason: PLAYED }
server → ¬C       card-played { playerId: C, cardType: SKIP, nopeWindowExpiresAt: t+3000 }

                  ... 3000 ms ...

server → all      NOPE_WINDOW_RESOLVED
server → all      TURN_SKIPPED { playerId: C, attackCount: 1 }
server → all      TURN_CHANGED { playerId: D, attackCount: 1 }
```

Compare with Turn 1: the payload looks identical, but here the Skip discharged the
last owed draw of an attack. Had C been at `attackCount: 2`, the Skip would have
decremented to `1` and C would have kept the turn.

**Deck 9 · kittens 3** · C holds 15, 23, 24, 27, 28, 48

Deck is now `39 25 21 43 3 30 0 35 1`.

---

## Endgame — Turns 13–24

Every mechanic is now covered, so the remaining turns are condensed. The traffic
pattern is the one already shown: `draw-card` → `card-received` + `card-drawn` →
`TURN_CHANGED`, with the defuse cycle when a kitten surfaces.

| Turn | Player | What happens | Deck after | Kittens |
|---|---|---|---|---|
| 13 | D | Draws 39 Tacocat | 8 | 3 |
| 14 | E | Draws 25 Shuffle | 7 | 3 |
| 15 | A | Draws 21 Favor | 6 | 3 |
| 16 | C | Draws 43 Hairy Potato Cat | 5 | 3 |
| 17 | D | Draws kitten 3, defuses with 7, inserts at position 0 | 5 | 3 |
| 18 | E | Draws kitten 3 straight back off the top, defuses with 8, inserts at 4 | 5 | 3 |
| 19 | A | Draws 30 See the Future | 4 | 3 |
| 20 | C | Draws kitten 0 — Defuse spent on Turn 12 → **eliminated** | 3 | 2 |
| 21 | D | Draws 35 Nope | 2 | 2 |
| 22 | E | Draws kitten 1 — Defuse spent on Turn 18 → **eliminated** | 1 | 1 |
| 23 | A | Draws kitten 3, defuses with 9, inserts at position 0 | 1 | 1 |
| 24 | D | Draws kitten 3 — Defuse spent on Turn 17 → **eliminated** | 0 | 0 |

Turn 17 into 18 is worth a look: D buried the kitten at position `0`, which is the
top of the deck, so E drew it immediately. `KITTEN_INSERTED` never reveals the
position, so E had no way to know.

The last elimination leaves one player standing:

```
D → server        draw-card { gameId }
server → all      EXPLODING_KITTEN_DRAWN { kittensInDeck: 0 }
server → D        DEFUSE_PROMPT { playerId: D, endsAt: t+..., canDefuse: false }
server → all      PLAYER_ELIMINATED { playerId: D, kittensInDeck: 0 }

                  One player alive — the machine goes to GAME_OVER rather than
                  changing the turn.

server → all      GAME_OVER { winner: { id: A, name: "...", avatarUrl: null } }

                  Sixty seconds later the game is deleted: every socket is forced
                  out of the room and receives left-game.
```

---

## Coverage

```
Winner: A

Eliminations
  Turn  7 — B   no Defuse (spent Turn 2)
  Turn 20 — C   no Defuse (spent Turn 12)
  Turn 22 — E   no Defuse (spent Turn 18)
  Turn 24 — D   no Defuse (spent Turn 17)

Card types
  See the Future    Turns 1, 11          peek, ack, then react
  Skip              Turns 1, 10, 12      both branches: turn-ending and attack-decrementing
  Attack            Turns 4, 5, 11       fresh attack, stacking to 4, and used as an escape
  Shuffle           Turn 7               invalidates a peek
  Favor             Turn 3               giver chooses, via choose-card-id
  Nope              Turn 3               Nope and counter-Nope cancelling out
  Cat pair          Turn 8               blind choose-card-index, type withheld
  Cat triple (hit)  Turn 2               choose-card-type, type revealed
  Cat triple (miss) Turn 6               NO_CARD_OF_REQUESTED_TYPE
  Defuse + insert   Turns 2, 6, 12, 17, 18, 23
  Exploding Kitten  Turns 2, 6, 7, 12, 17, 18, 20, 22, 23, 24

Protocol edges
  Nope window restarting on each Nope                Turn 3
  Two Nopes cancelling, so the action executes       Turn 3
  Kitten draw consuming the draw it was drawn on     Turn 2
  attackCount surviving a defuse mid-attack          Turns 6, 12
  DEFUSE_PROMPT with canDefuse: false                Turns 7, 24
  Insertion position never revealed                  Turns 17, 18
  Turn order closing over an eliminated player       Turn 7
```

Not shown: `reconnect-game` / `game-state` recovery, and the 60-second auto-draw for
a disconnected player. Both are connection-level rather than gameplay, and live in
[connection.yaml](../sockets/connection/connection.yaml).
