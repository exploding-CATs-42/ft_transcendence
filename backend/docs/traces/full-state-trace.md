# Full Game State Trace — Interface Mutations

> Tracks how every interface (GameState, TurnState, PendingAction, NopeChain, FavorState, Deck, Player)
> changes across the full 21-turn game. Shows the relationship between objects at each step.

---

## Initial State After Deal

```
GameState {
  gameId: "game-1"
  status: PLAYING
  winnerId: null
  createdAt: 1700000000
  startedAt: 1700000010
  finishedAt: null

  rules: {
    dealtCardsPerPlayer: 7
    defusesDealtPerPlayer: 1
    maxDefusesShuffledBack: 2
    totalDefuses: 6
    seeTheFutureCount: 3
    minPlayers: 2
    maxPlayers: 5
    fasterVariantRemoveFraction: 0.33
    nopeWindowMs: 3000
  }

  players: [
    { playerId: "A", displayName: "Alice", isAlive: true, turnOrder: 0,
      hand: [defuse_inst_a, stf_inst_1, skip_inst_1, taco_inst_1, taco_inst_2, nope_inst_1, beard_inst_1] }
    { playerId: "B", displayName: "Bob", isAlive: true, turnOrder: 1,
      hand: [defuse_inst_b, attack_inst_1, catter_inst_1, catter_inst_2, catter_inst_3, shuffle_inst_1, hairy_inst_1] }
    { playerId: "C", displayName: "Charlie", isAlive: true, turnOrder: 2,
      hand: [defuse_inst_c, favor_inst_1, nope_inst_2, rainbow_inst_1, rainbow_inst_2, skip_inst_6, beard_inst_2] }
    { playerId: "D", displayName: "Diana", isAlive: true, turnOrder: 3,
      hand: [defuse_inst_d, attack_inst_3, stf_inst_4, taco_inst_4, shuffle_inst_4, hairy_inst_2, nope_inst_3] }
    { playerId: "E", displayName: "Eve", isAlive: true, turnOrder: 4,
      hand: [defuse_inst_e, favor_inst_2, beard_inst_3, beard_inst_4, beard_inst_5, catter_inst_4, skip_inst_5] }
  ]

  deck: {
    drawPile: [ek_inst_1, shuffle_inst_3, attack_inst_2, ...14 more cards..., ek_inst_2, ...more..., ek_inst_3, ek_inst_4]
    discardPile: []
  }
  // drawPile.length = 16 (56 total - 40 dealt to players)
  // Includes: 4 Exploding Kittens + 1 extra Defuse + 11 normal cards

  turn: {
    currentPlayerId: "A"
    phase: ACTION
    attackCount: 1
    isUnderAttack: false
    pendingAction: null
    nopeChain: null
    favorState: null
    turnNumber: 1
  }
}
```

---

## Turn 1 — A: See the Future + Skip

### 1a. A plays See the Future

```
A.hand BEFORE: [defuse_inst_a, stf_inst_1, skip_inst_1, taco_inst_1, taco_inst_2, nope_inst_1, beard_inst_1]

MUTATION: remove stf_inst_1 from A.hand → deck.discardPile
  A.hand: [...6 cards, stf_inst_1 removed]
  deck.discardPile: [stf_inst_1]

MUTATION: create PendingAction + NopeChain, set phase
  turn.phase: ACTION → NOPE_WINDOW
  turn.pendingAction: null → {
    actionId: "uuid-1"
    type: SEE_THE_FUTURE
    playerId: "A"
    cards: [stf_inst_1]
    targetPlayerId: undefined
    namedCardType: undefined
    isNoped: false
    nopeWindowExpiresAt: 1700000013000
  }
  turn.nopeChain: null → {
    pendingActionId: "uuid-1"
    entries: []
  }
```

### 1b. Timer expires → See the Future resolves

```
CHECK: turn.pendingAction.isNoped === false → execute

READ: turn.pendingAction.type === SEE_THE_FUTURE
READ: deck.drawPile.slice(0, rules.seeTheFutureCount)
  → [ek_inst_1, shuffle_inst_3, attack_inst_2]
  (deck is NOT modified, only peeked)

MUTATION: clear PendingAction + NopeChain, set phase
  turn.phase: NOPE_WINDOW → ACTION
  turn.pendingAction: {...} → null
  turn.nopeChain: {...} → null

PRIVATE → A: SEE_THE_FUTURE_PEEK { cards: [ek_inst_1, shuffle_inst_3, attack_inst_2] }
```

### 1c. A plays Skip

```
MUTATION: remove skip_inst_1 from A.hand → deck.discardPile
  A.hand: [...5 cards, skip_inst_1 removed]
  deck.discardPile: [skip_inst_1, stf_inst_1]

MUTATION: create PendingAction + NopeChain, set phase
  turn.phase: ACTION → NOPE_WINDOW
  turn.pendingAction: null → {
    actionId: "uuid-2"
    type: SKIP
    playerId: "A"
    cards: [skip_inst_1]
    isNoped: false
    nopeWindowExpiresAt: 1700000016000
  }
  turn.nopeChain: null → { pendingActionId: "uuid-2", entries: [] }
```

### 1d. Timer expires → Skip resolves

```
CHECK: turn.pendingAction.isNoped === false → execute
READ: turn.pendingAction.type === SKIP

SKIP LOGIC:
  turn.attackCount was 1
  turn.attackCount-- → 0
  attackCount === 0 → turn ends

MUTATION: clear PendingAction + NopeChain
  turn.pendingAction: {...} → null
  turn.nopeChain: {...} → null

MUTATION: advance turn
  turn.currentPlayerId: "A" → "B"
  turn.phase: NOPE_WINDOW → ACTION
  turn.attackCount: 0 → 1 (reset for new turn)
  turn.isUnderAttack: false
  turn.turnNumber: 1 → 2

A.hand AFTER: [defuse_inst_a, taco_inst_1, taco_inst_2, nope_inst_1, beard_inst_1]  (5 cards)
```

---

## Turn 2 — B: Pair Combo + Draw EK + Defuse + Insert + Draw

### 2a. B plays pair of Cattermelons targeting C

```
B.hand BEFORE: [defuse_inst_b, attack_inst_1, catter_inst_1, catter_inst_2, catter_inst_3, shuffle_inst_1, hairy_inst_1]

MUTATION: remove catter_inst_1, catter_inst_2 from B.hand → deck.discardPile
  B.hand: [defuse_inst_b, attack_inst_1, catter_inst_3, shuffle_inst_1, hairy_inst_1]
  deck.discardPile: [catter_inst_2, catter_inst_1, skip_inst_1, stf_inst_1]

MUTATION: create PendingAction + NopeChain, set phase
  turn.phase: ACTION → NOPE_WINDOW
  turn.pendingAction: null → {
    actionId: "uuid-3"
    type: CAT_PAIR
    playerId: "B"
    cards: [catter_inst_1, catter_inst_2]
    targetPlayerId: "C"
    isNoped: false
    nopeWindowExpiresAt: ...
  }
  turn.nopeChain: null → { pendingActionId: "uuid-3", entries: [] }
```

### 2b. Timer expires → Pair resolves

```
CHECK: turn.pendingAction.isNoped === false → execute
READ: turn.pendingAction.type === CAT_PAIR
READ: turn.pendingAction.targetPlayerId === "C"

PAIR LOGIC: pick random card from C.hand → nope_inst_2

MUTATION: transfer card
  C.hand: [defuse_inst_c, favor_inst_1, nope_inst_2, rainbow_inst_1, rainbow_inst_2, skip_inst_6, beard_inst_2]
    → remove nope_inst_2
    → [defuse_inst_c, favor_inst_1, rainbow_inst_1, rainbow_inst_2, skip_inst_6, beard_inst_2]
  B.hand: [defuse_inst_b, attack_inst_1, catter_inst_3, shuffle_inst_1, hairy_inst_1]
    → add nope_inst_2
    → [defuse_inst_b, attack_inst_1, catter_inst_3, shuffle_inst_1, hairy_inst_1, nope_inst_2]

MUTATION: clear PendingAction + NopeChain, set phase
  turn.phase: NOPE_WINDOW → ACTION
  turn.pendingAction: {...} → null
  turn.nopeChain: {...} → null
```

### 2c. B draws → Exploding Kitten

```
MUTATION: draw from deck
  deck.drawPile: [ek_inst_1, shuffle_inst_3, attack_inst_2, ...]
    → shift() returns ek_inst_1
    → [shuffle_inst_3, attack_inst_2, ...]

CHECK: drawn card type === EXPLODING_KITTEN
  (card is NOT added to hand, NOT added to discard — it's held in limbo)

MUTATION: set phase
  turn.phase: ACTION → DEFUSE_PROMPT
```

### 2d. B plays Defuse

```
MUTATION: remove defuse_inst_b from B.hand → deck.discardPile
  B.hand: [attack_inst_1, catter_inst_3, shuffle_inst_1, hairy_inst_1, nope_inst_2]
  deck.discardPile: [defuse_inst_b, catter_inst_2, catter_inst_1, ...]

MUTATION: set phase
  turn.phase: DEFUSE_PROMPT → INSERT_KITTEN
```

### 2e. B inserts kitten at position 13

```
MUTATION: insert ek_inst_1 into deck.drawPile at index 13
  deck.drawPile.splice(13, 0, ek_inst_1)
  deck.drawPile.length: 15 → 16

MUTATION: set phase
  turn.phase: INSERT_KITTEN → ACTION
  (attackCount unchanged, B still owes a draw)
```

### 2f. B draws normal card

```
MUTATION: draw from deck
  deck.drawPile: [shuffle_inst_3, attack_inst_2, ...]
    → shift() returns shuffle_inst_3
  deck.drawPile.length: 16 → 15

MUTATION: add to hand
  B.hand: → add shuffle_inst_3
    → [attack_inst_1, catter_inst_3, shuffle_inst_1, hairy_inst_1, nope_inst_2, shuffle_inst_3]

DRAW LOGIC:
  turn.attackCount was 1
  turn.attackCount-- → 0
  attackCount === 0 → turn ends

MUTATION: advance turn
  turn.currentPlayerId: "B" → "C"
  turn.phase: ACTION
  turn.attackCount: 0 → 1
  turn.isUnderAttack: false
  turn.turnNumber: 2 → 3

B.hand AFTER: [attack_inst_1, catter_inst_3, shuffle_inst_1, hairy_inst_1, nope_inst_2, shuffle_inst_3]  (6 cards, no Defuse)
```

---

## Turn 3 — C: Favor on D

### 3a. C plays Favor targeting D

```
C.hand BEFORE: [defuse_inst_c, favor_inst_1, rainbow_inst_1, rainbow_inst_2, skip_inst_6, beard_inst_2]

MUTATION: remove favor_inst_1 from C.hand → deck.discardPile
  C.hand: [defuse_inst_c, rainbow_inst_1, rainbow_inst_2, skip_inst_6, beard_inst_2]

MUTATION: create PendingAction + NopeChain, set phase
  turn.phase: ACTION → NOPE_WINDOW
  turn.pendingAction: null → {
    actionId: "uuid-4"
    type: FAVOR
    playerId: "C"
    cards: [favor_inst_1]
    targetPlayerId: "D"      ← target stored here during Nope window
    isNoped: false
    nopeWindowExpiresAt: ...
  }
  turn.nopeChain: null → { pendingActionId: "uuid-4", entries: [] }
  turn.favorState: null       ← not yet, still in Nope window
```

### 3b. Timer expires → Favor resolves

```
CHECK: turn.pendingAction.isNoped === false → execute
READ: turn.pendingAction.type === FAVOR
READ: turn.pendingAction.targetPlayerId === "D"   ← handoff source

MUTATION: create FavorState from PendingAction fields (THE HANDOFF)
  turn.favorState: null → {
    requesterId: "C"                ← from pendingAction.playerId
    targetPlayerId: "D"             ← from pendingAction.targetPlayerId
  }

MUTATION: clear PendingAction + NopeChain, set phase
  turn.phase: NOPE_WINDOW → FAVOR_SELECT
  turn.pendingAction: {...} → null    ← destroyed after handoff
  turn.nopeChain: {...} → null

  PendingAction is now null. FavorState carries the context forward.
```

### 3c. D gives a card (FAVOR_GIVE)

```
READ: turn.favorState.targetPlayerId === "D" (validate sender)
READ: turn.favorState.requesterId === "C" (who receives)

D.hand BEFORE: [defuse_inst_d, attack_inst_3, stf_inst_4, taco_inst_4, shuffle_inst_4, hairy_inst_2, nope_inst_3]

MUTATION: transfer taco_inst_4 from D → C
  D.hand: → remove taco_inst_4
    → [defuse_inst_d, attack_inst_3, stf_inst_4, shuffle_inst_4, hairy_inst_2, nope_inst_3]
  C.hand: → add taco_inst_4
    → [defuse_inst_c, rainbow_inst_1, rainbow_inst_2, skip_inst_6, beard_inst_2, taco_inst_4]

MUTATION: clear FavorState, set phase
  turn.favorState: {...} → null
  turn.phase: FAVOR_SELECT → ACTION
```

### 3d. C draws normal card

```
MUTATION: draw + add to hand
  deck.drawPile → shift() → beard_inst_5
  C.hand → add beard_inst_5
    → [defuse_inst_c, rainbow_inst_1, rainbow_inst_2, skip_inst_6, beard_inst_2, taco_inst_4, beard_inst_5]

DRAW LOGIC: attackCount 1 → 0 → turn ends

MUTATION: advance turn
  turn.currentPlayerId: "C" → "D"
  turn.turnNumber: 3 → 4

C.hand AFTER: 7 cards
```

---

## Turn 4 — D: Shuffle + Draw

### 4a. D plays Shuffle

```
MUTATION: remove shuffle_inst_4 from D.hand → discardPile
MUTATION: create PendingAction { type: SHUFFLE, ... } + NopeChain, phase → NOPE_WINDOW
```

### 4b. Timer expires → Shuffle resolves

```
CHECK: isNoped === false → execute
READ: type === SHUFFLE

MUTATION: shuffle deck
  deck.drawPile = shuffle(deck.drawPile)
  (same cards, random new order, length unchanged)

MUTATION: clear PendingAction + NopeChain, phase → ACTION
```

### 4c. D draws normal card

```
MUTATION: draw favor_inst_3 → D.hand
DRAW LOGIC: attackCount 1 → 0 → turn ends

MUTATION: advance turn → E, turnNumber: 4 → 5

D.hand AFTER: [defuse_inst_d, attack_inst_3, stf_inst_4, hairy_inst_2, nope_inst_3, favor_inst_3]  (6 cards)
```

---

## Turn 5 — E: Favor on A + Skip

### 5a. E plays Favor targeting A

```
MUTATION: remove favor_inst_2 from E.hand → discardPile
MUTATION: create PendingAction { type: FAVOR, targetPlayerId: "A", ... } + NopeChain, phase → NOPE_WINDOW
```

### 5b. Timer expires → Favor resolves

```
MUTATION: HANDOFF → create FavorState { requesterId: "E", targetPlayerId: "A" }
MUTATION: clear PendingAction + NopeChain, phase → FAVOR_SELECT
```

### 5c. A gives beard_inst_1 to E

```
MUTATION: transfer beard_inst_1
  A.hand: → remove beard_inst_1 → [defuse_inst_a, taco_inst_1, taco_inst_2, nope_inst_1]
  E.hand: → add beard_inst_1

MUTATION: clear FavorState, phase → ACTION
```

### 5d. E plays Skip

```
MUTATION: remove skip_inst_5 from E.hand → discardPile
MUTATION: create PendingAction { type: SKIP, ... } + NopeChain, phase → NOPE_WINDOW

Timer expires → execute
SKIP LOGIC: attackCount 1 → 0 → turn ends

MUTATION: advance turn → A, turnNumber: 5 → 6

E.hand AFTER: [defuse_inst_e, beard_inst_3, beard_inst_4, beard_inst_5, catter_inst_4, beard_inst_1]  (6 cards)
```

---

## Turn 6 — A: Pair Combo (steal E's Defuse) + Draw

### 6a. A plays pair of Tacocats targeting E

```
A.hand BEFORE: [defuse_inst_a, taco_inst_1, taco_inst_2, nope_inst_1]

MUTATION: remove taco_inst_1, taco_inst_2 from A.hand → discardPile
  A.hand: [defuse_inst_a, nope_inst_1]

MUTATION: create PendingAction + NopeChain, phase → NOPE_WINDOW
  turn.pendingAction: {
    type: CAT_PAIR
    playerId: "A"
    cards: [taco_inst_1, taco_inst_2]
    targetPlayerId: "E"
  }
```

### 6b. Timer expires → Pair resolves

```
PAIR LOGIC: random card from E.hand → defuse_inst_e

MUTATION: transfer
  E.hand: → remove defuse_inst_e
    → [beard_inst_3, beard_inst_4, beard_inst_5, catter_inst_4, beard_inst_1]
  A.hand: → add defuse_inst_e
    → [defuse_inst_a, nope_inst_1, defuse_inst_e]

  *** E now has NO DEFUSE ***
  *** A now has 2 DEFUSES ***

MUTATION: clear PendingAction + NopeChain, phase → ACTION
```

### 6c. A draws normal card

```
MUTATION: draw hairy_inst_6 → A.hand
  A.hand → [defuse_inst_a, nope_inst_1, defuse_inst_e, hairy_inst_6]
DRAW LOGIC: attackCount 1 → 0 → turn ends

MUTATION: advance turn → B, turnNumber: 6 → 7
```

---

## Turn 7 — B: Attack + Nope + Counter-Nope

### 7a. B plays Attack

```
MUTATION: remove attack_inst_1 from B.hand → discardPile
MUTATION: create PendingAction { type: ATTACK, ... } + NopeChain, phase → NOPE_WINDOW
  turn.pendingAction: {
    actionId: "uuid-9"
    type: ATTACK
    playerId: "B"
    cards: [attack_inst_1]
    isNoped: false
    nopeWindowExpiresAt: ...
  }
  turn.nopeChain: { pendingActionId: "uuid-9", entries: [] }
```

### 7b. D plays Nope

```
MUTATION: remove nope_inst_3 from D.hand → discardPile
  D.hand: [defuse_inst_d, attack_inst_3, stf_inst_4, hairy_inst_2, favor_inst_3]

MUTATION: append to NopeChain, flip parity, reset timer
  turn.nopeChain.entries: []
    → [{ playerId: "D", cardInstanceId: "nope_inst_3" }]
  turn.pendingAction.isNoped: false → true        ← entries.length=1, 1%2===1
  turn.pendingAction.nopeWindowExpiresAt: reset to now() + 3000
```

### 7c. B counter-Nopes (using Nope stolen from C in turn 2)

```
MUTATION: remove nope_inst_2 from B.hand → discardPile
  B.hand: [catter_inst_3, shuffle_inst_1, hairy_inst_1, shuffle_inst_3]

MUTATION: append to NopeChain, flip parity, reset timer
  turn.nopeChain.entries:
    [{ playerId: "D", cardInstanceId: "nope_inst_3" }]
    → [
        { playerId: "D", cardInstanceId: "nope_inst_3" },
        { playerId: "B", cardInstanceId: "nope_inst_2" }
      ]
  turn.pendingAction.isNoped: true → false         ← entries.length=2, 2%2===0
  turn.pendingAction.nopeWindowExpiresAt: reset to now() + 3000
```

### 7d. Timer expires → Attack resolves

```
CHECK: turn.pendingAction.isNoped === false → execute
READ: turn.pendingAction.type === ATTACK

ATTACK LOGIC:
  turn.isUnderAttack === false → FLAT 2
  next player (C) gets attackCount = 2

MUTATION: clear PendingAction + NopeChain
  turn.pendingAction: {...} → null
  turn.nopeChain: {...} → null

MUTATION: advance turn (Attack bypasses draw)
  turn.currentPlayerId: "B" → "C"
  turn.phase: NOPE_WINDOW → ACTION
  turn.attackCount: → 2           ← from Attack
  turn.isUnderAttack: → true      ← created by Attack
  turn.turnNumber: 7 → 8

B.hand AFTER: [catter_inst_3, shuffle_inst_1, hairy_inst_1, shuffle_inst_3]  (4 cards, no Defuse, no Nope)
```

---

## Turn 8 — C: Skip (under attack) + Draw

### 8a. C plays Skip while under attack

```
TurnState BEFORE: { currentPlayer: C, attackCount: 2, isUnderAttack: true }

MUTATION: remove skip_inst_6 → discardPile
MUTATION: create PendingAction { type: SKIP } + NopeChain, phase → NOPE_WINDOW
```

### 8b. Timer expires → Skip resolves

```
CHECK: isNoped === false → execute
READ: type === SKIP

SKIP LOGIC (under attack):
  turn.attackCount was 2
  turn.attackCount-- → 1
  attackCount > 0 → back to ACTION, player owes more draws

MUTATION: clear PendingAction + NopeChain, phase → ACTION
  (turn does NOT advance, C still has draws to complete)
```

### 8c. C draws normal card

```
MUTATION: draw catter_inst_7 → C.hand
DRAW LOGIC:
  turn.attackCount was 1
  turn.attackCount-- → 0
  attackCount === 0 → turn ends

MUTATION: advance turn → D, turnNumber: 8 → 9
  turn.attackCount: → 1 (reset)
  turn.isUnderAttack: → false

C used Skip to reduce 2 draws to 1. Total draws: 1 instead of 2.
```

---

## Turn 9 — D: Attack (stacking)

### 9a. D plays Attack while not under attack

```
TurnState: { currentPlayer: D, attackCount: 1, isUnderAttack: false }

MUTATION: remove attack_inst_3 → discardPile
MUTATION: create PendingAction { type: ATTACK } + NopeChain, phase → NOPE_WINDOW
```

### 9b. Timer expires → Attack resolves

```
ATTACK LOGIC:
  turn.isUnderAttack === false → FLAT 2
  next player: E (alive), gets attackCount = 2

MUTATION: advance turn
  turn.currentPlayerId: "D" → "E"
  turn.attackCount: → 2
  turn.isUnderAttack: → true
  turn.turnNumber: 9 → 10
```

---

## Turn 10 — E: Draw twice (no Defuse) → ELIMINATED

### 10a. E draws first card (normal)

```
TurnState: { currentPlayer: E, attackCount: 2, isUnderAttack: true }
E.hand: [beard_inst_3, beard_inst_4, beard_inst_5, catter_inst_4, beard_inst_1]
  *** NO DEFUSE ***

MUTATION: draw hairy_inst_8 → E.hand
DRAW LOGIC: attackCount 2 → 1, still > 0 → back to ACTION
```

### 10b. E draws second card → Exploding Kitten

```
MUTATION: draw from deck → ek_inst_2 (EXPLODING_KITTEN)
  deck.drawPile → shift() → ek_inst_2

CHECK: type === EXPLODING_KITTEN
MUTATION: phase → DEFUSE_PROMPT

CHECK: E.hand contains DEFUSE? → NO

MUTATION: eliminate E
  E.isAlive: true → false
  E.hand: [beard_inst_3, beard_inst_4, beard_inst_5, catter_inst_4, beard_inst_1, hairy_inst_8]
    → all cards + ek_inst_2 moved to deck.discardPile
    → E.hand: []

PRIVATE → E: CARD_REMOVED × 6 { reason: EXPLODED } + CARD_REMOVED { ek_inst_2, EXPLODED }

CHECK: alive players count?
  A(alive), B(alive), C(alive), D(alive) = 4 → game continues

MUTATION: advance turn → A (next alive after E)
  turn.currentPlayerId: "E" → "A"
  turn.turnNumber: 10 → 11
```

---

## Turns 11–12 (abbreviated)

### Turn 11 — A: See the Future + Draw

```
A peeks: [normal, normal, ek_inst_3]. Safe to draw top.
A draws normal card. Turn ends → B.
```

### Turn 12 — B: Draw → Exploding Kitten → No Defuse → ELIMINATED

```
B draws ek_inst_3. B has no Defuse (used in turn 2).
B.isAlive: true → false
B.hand → all to discardPile

Alive: A, C, D (3 players). Turn order now skips B and E.
Advance → C, turnNumber: 13.
```

---

## Turn 13 — C: Pair Combo (Rainbow-Ralphing Cats) + Draw

### 13a. C plays pair targeting D

```
MUTATION: remove rainbow_inst_1, rainbow_inst_2 from C.hand → discardPile
MUTATION: create PendingAction { type: CAT_PAIR, targetPlayerId: "D" } + NopeChain, phase → NOPE_WINDOW
```

### 13b. Timer expires → Pair resolves

```
PAIR LOGIC: random card from D.hand → stf_inst_4

MUTATION: transfer
  D.hand: → remove stf_inst_4
  C.hand: → add stf_inst_4

MUTATION: clear, phase → ACTION
```

### 13c. C draws normally

```
Turn ends → D, turnNumber: 14.
```

---

## Turn 14 — D: Favor (Noped by A) + Draw EK + Defuse + Insert + Draw

### 14a. D plays Favor targeting A

```
MUTATION: remove favor_inst_3 → discardPile
MUTATION: create PendingAction { type: FAVOR, targetPlayerId: "A" } + NopeChain, phase → NOPE_WINDOW
```

### 14b. A plays Nope

```
MUTATION: remove nope_inst_1 from A.hand → discardPile
MUTATION: append to NopeChain
  turn.nopeChain.entries: [] → [{ playerId: "A", cardInstanceId: "nope_inst_1" }]
  turn.pendingAction.isNoped: false → true
  turn.pendingAction.nopeWindowExpiresAt: reset
```

### 14c. Timer expires → Favor cancelled

```
CHECK: turn.pendingAction.isNoped === true → CANCELLED

MUTATION: clear PendingAction + NopeChain, phase → ACTION
  turn.pendingAction: {...} → null
  turn.nopeChain: {...} → null
  turn.favorState: still null     ← FavorState was NEVER CREATED because action was Noped
  
  Favor card + Nope card both stay on discardPile (lost per rules).
  D still needs to draw.
```

### 14d. D draws Exploding Kitten

```
MUTATION: draw → ek_inst_4 (EXPLODING_KITTEN)
MUTATION: phase → DEFUSE_PROMPT

D has defuse_inst_d.
```

### 14e. D plays Defuse

```
MUTATION: remove defuse_inst_d from D.hand → discardPile
MUTATION: phase → INSERT_KITTEN
```

### 14f. D inserts kitten at position 0 (top — trap for A)

```
MUTATION: deck.drawPile.splice(0, 0, ek_inst_4)
  ek_inst_4 is now the top card of the deck

MUTATION: phase → ACTION (D still owes a draw)
```

### 14g. D draws normal card

```
MUTATION: draw → deck.drawPile.shift()
  This draws ek_inst_4... wait, D just placed it at position 0.
  Actually after insert, drawPile[0] = ek_inst_4. D draws the kitten they just placed!

  Correction: D would draw their own kitten. This is a mistake in the game narrative.
  In practice D would put the kitten deeper. Let's say D puts it at position 1 instead.

CORRECTED: D inserts at position 1
  deck.drawPile[0] = some normal card
  deck.drawPile[1] = ek_inst_4

MUTATION: draw normal card from position 0 → D.hand
DRAW LOGIC: attackCount 1 → 0 → turn ends

MUTATION: advance turn → A (skip B and E, both dead)
  turn.turnNumber: 14 → 15

D.hand AFTER: no Defuse remaining
```

---

## Turn 15 — A: Draw → EK at position 0 (D placed kitten at 1, now shifted to 0)

```
After D drew from position 0, the kitten at position 1 shifted to position 0.

A draws → ek_inst_4 (EXPLODING_KITTEN)
phase → DEFUSE_PROMPT

A has 2 Defuses: defuse_inst_a, defuse_inst_e

MUTATION: remove defuse_inst_a → discardPile
MUTATION: phase → INSERT_KITTEN

A inserts at position 1.
MUTATION: deck.drawPile.splice(1, 0, ek_inst_4)

phase → ACTION (A still owes a draw)

A draws normal card. attackCount 1 → 0 → turn ends.

MUTATION: advance → C (skip B, E dead), turnNumber: 15 → 16

A.hand AFTER: still has defuse_inst_e (1 Defuse remaining)
```

---

## Turns 16-21 (abbreviated — game concludes)

### Turn 16 — C: See the Future + Shuffle + Draw

```
C uses stf_inst_4 (stolen from D). Sees kitten at position 1. Plays Shuffle.
Deck reshuffled. Draws normal card. Turn ends → D.
```

### Turn 17 — D: Draw → EK → No Defuse → ELIMINATED

```
D draws Exploding Kitten. No Defuse (used turn 14).
D.isAlive: true → false
Alive: A, C (2 players). Advance → A.
```

### Turn 18 — A: Draw normal

```
A draws. Turn ends → C.
```

### Turn 19 — C: Draw → EK → Defuse → Insert → Draw

```
C draws EK. Plays defuse_inst_c. Inserts kitten at position 0.
Draws normal card. Turn ends → A.
C.hand AFTER: no Defuse remaining.
```

### Turn 20 — A: Draw → EK (placed by C) → Defuse → Insert → Draw

```
A draws kitten placed by C. Plays defuse_inst_e (last Defuse).
Inserts kitten at position 0. Draws normal card. Turn ends → C.
A.hand AFTER: no Defuse remaining.
```

### Turn 21 — C: Draw → EK → No Defuse → ELIMINATED → GAME OVER

```
C draws kitten placed by A.
C has no Defuse.

MUTATION: eliminate C
  C.isAlive: true → false

CHECK: alive players count?
  A(alive) = 1 → GAME OVER

MUTATION:
  GameState.winnerId: null → "A"
  GameState.status: PLAYING → FINISHED
  GameState.finishedAt: null → 1700001200

BROADCAST: GAME_OVER { winnerId: "A" }
```

---

## Interface Lifecycle Summary

### PendingAction lifecycle (created and destroyed 14 times)

```
Created: when any card or combo is played
  ← populated from PlayCardAction or PlayComboAction fields
  ← always paired with NopeChain creation
  ← phase always set to NOPE_WINDOW

Lives: during NOPE_WINDOW phase only
  ← isNoped flips on each Nope entry
  ← nopeWindowExpiresAt resets on each Nope entry

Destroyed: when timer expires
  ← if FAVOR + executed: targetPlayerId handed off to FavorState before destruction
  ← always paired with NopeChain destruction
  ← phase always changes away from NOPE_WINDOW
```

### NopeChain lifecycle (always paired with PendingAction)

```
Created: simultaneously with PendingAction, starts with empty entries
Modified: entries.push() on each PLAY_NOPE
Destroyed: simultaneously with PendingAction on timer expiry
Never exists without PendingAction. Never outlives PendingAction.
```

### FavorState lifecycle (created only when Favor resolves)

```
NOT created: when Favor card is played (that creates PendingAction)
NOT created: when Favor is Noped (PendingAction destroyed, FavorState never touched)
Created: only when Favor's Nope window resolves with executed=true
  ← requesterId from PendingAction.playerId
  ← targetPlayerId from PendingAction.targetPlayerId
  ← phase set to FAVOR_SELECT

Lives: during FAVOR_SELECT phase only
Destroyed: when target sends FAVOR_GIVE
  ← phase returns to ACTION
```

### Deck mutations

```
drawPile.shift()           → every DRAW_CARD
drawPile.splice(i, 0, ek)  → every INSERT_KITTEN
shuffle(drawPile)           → every SHUFFLE resolved
discardPile.unshift(card)   → every card played, every Nope, every Defuse
```

### Player.hand mutations

```
Remove: card played (PLAYED), card stolen (STOLEN), card given (GIVEN_AWAY), eliminated (EXPLODED)
Add: card drawn (fromId: null), card received via combo (fromId: playerId), card received via Favor (fromId: playerId)
Clear: entire hand on elimination → discardPile
```

### Turn advancement patterns

```
Normal end:    attackCount reaches 0 after draw → next alive player, attackCount=1, isUnderAttack=false
Attack end:    Attack resolves → next alive player, attackCount=2 (or stacked), isUnderAttack=true
Skip end:      attackCount reaches 0 after Skip decrement → next alive player
Elimination:   player dies → next alive player, attackCount=1, isUnderAttack=false
```
