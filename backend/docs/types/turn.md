# turn.ts

## TurnPhase

The current state of a player's turn. Broadcast to all clients via `PublicTurnView`.

| Value | Description |
|---|---|
| ACTION | Player may play cards or draw to end turn |
| NOPE_WINDOW | A card was played; timer running, any alive player may play a Nope |
| DEFUSE_PROMPT | Player drew an Exploding Kitten; must play Defuse or die |
| INSERT_KITTEN | Player defused; must choose where to reinsert the kitten |
| FAVOR_SELECT | Target player must choose a card to give |

DRAW is not a phase. When the player sends `DRAW_CARD` during ACTION, the server processes the draw atomically and either returns to ACTION (sub-turn under Attack), advances the turn, or transitions to DEFUSE_PROMPT.

## PendingActionType

What kind of action is waiting in the Nope window.

| Value | Description |
|---|---|
| ATTACK | End turn, force next player to take extra turns |
| SKIP | End turn without drawing (or cancel one owed draw) |
| FAVOR | Force target to give a card |
| SHUFFLE | Randomize the draw pile |
| SEE_THE_FUTURE | Peek at top N cards (N = `rules.seeTheFutureCount`) |
| CAT_PAIR | 2 matching cards, steal a random card from target |
| CAT_TRIPLE | 3 matching cards, steal a named card from target |

## TurnState

Everything that is true right now about whose turn it is. Reset each time the active player changes.

| Field | Description |
|---|---|
| currentPlayerId | Who is taking this turn |
| phase | Current TurnPhase |
| attackCount | Total draws this player must complete before their turn ends. Normally 1. Set to 2+ when targeted by Attack. Decrements after each draw. Turn ends when it reaches 0 |
| isUnderAttack | `true` if this turn was created by an Attack card. `false` on normal turn advancement. Used only for the Attack resolution formula (see below) |
| pendingAction | Non-null only while phase is NOPE_WINDOW. Holds the action awaiting resolution |
| nopeChain | Non-null only while phase is NOPE_WINDOW. Created alongside pendingAction with empty entries. Entries appended as Nopes are played; each resets the timer |
| favorState | Non-null only while phase is FAVOR_SELECT |
| turnNumber | Increments each time currentPlayerId changes |

### attackCount + isUnderAttack

The official rules define two distinct cases for Attack:

- **Base case** (normal turn, `isUnderAttack = false`): "Force the next player to take 2 turns" → next gets `attackCount = 2`
- **Stacking case** (under attack, `isUnderAttack = true`): "Remaining untaken turns PLUS 2 additional" → next gets `attackCount = current attackCount + 2`

Without `isUnderAttack`, `attackCount = 1` is ambiguous — it could mean a normal turn or an attacked turn after one draw.

| Situation | attackCount | isUnderAttack | Plays Attack → next gets |
|---|---|---|---|
| Normal turn | 1 | false | 2 |
| Attacked, no draws yet | 2 | true | 4 |
| Attacked, drew once | 1 | true | 3 |
| Double attacked | 4 | true | 6 |

### Draw logic

```
player draws a card
attackCount--
if attackCount > 0 → back to ACTION (player owes more draws)
if attackCount === 0 → turn ends, advance to next player
```

### Skip logic

```
attackCount--
if attackCount > 0 → back to ACTION (owes more draws)
if attackCount === 0 → turn ends
```

## PendingAction

A card play that has been announced but not yet resolved. Lives in `TurnState.pendingAction` while phase is NOPE_WINDOW. Cleared once the timer expires.

| Field | Description |
|---|---|
| actionId | UUID for this specific pending event |
| type | PendingActionType — what kind of action this is |
| playerId | Who played the card(s) |
| cards | The card(s) placed on the discard pile |
| targetPlayerId | Present for FAVOR, CAT_PAIR, CAT_TRIPLE. Stored here so it survives the Nope window. Handed off to FavorState on Favor resolution |
| namedCardType | Present for CAT_TRIPLE only — the card type being demanded |
| isNoped | Current parity. `true` = currently cancelled. Derived from `nopeChain.entries.length % 2 === 1` but cached here so broadcasts don't need the chain |
| nopeWindowExpiresAt | Epoch ms. When this window auto-resolves. Client uses it for countdown, server uses it for setTimeout |

### Timer behavior

1. Created with `nopeWindowExpiresAt = now() + rules.nopeWindowMs`
2. Each `PLAY_NOPE` resets `nopeWindowExpiresAt = now() + rules.nopeWindowMs`
3. When `Date.now() >= nopeWindowExpiresAt` → server resolves at current parity
4. Any alive player holding a Nope may play it while the window is open

## NopeEntry

One Nope played in a chain. Array order provides sequencing.

| Field | Description |
|---|---|
| playerId | Who played this Nope |
| cardInstanceId | instanceId of the Nope card used |

## NopeChain

Ordered log of every Nope played against a single PendingAction.

| Field | Description |
|---|---|
| pendingActionId | Links back to the PendingAction being contested |
| entries | Ordered list of NopeEntry. `isNoped = entries.length % 2 === 1` |

## FavorState

Tracks an in-progress Favor request. Created when a Favor action resolves (not Noped). `targetPlayerId` is handed off from `PendingAction.targetPlayerId`.

| Field | Description |
|---|---|
| requesterId | Player who played the Favor card |
| targetPlayerId | Player who must give a card. No time limit enforced |
