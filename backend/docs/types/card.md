# card.ts

## CardType

All 13 card types in the base deck.

| Value | Cards in deck | Category |
|---|---|---|
| EXPLODING_KITTEN | 4 | Drawn, never played from hand |
| DEFUSE | 6 | Response to drawing an Exploding Kitten |
| ATTACK | 4 | Action card |
| SKIP | 4 | Action card |
| FAVOR | 4 | Action card (requires target) |
| SHUFFLE | 4 | Action card |
| SEE_THE_FUTURE | 5 | Action card |
| NOPE | 5 | Interrupt card (playable out of turn) |
| TACOCAT | 4 | Cat card (combo only) |
| HAIRY_POTATO_CAT | 4 | Cat card (combo only) |
| BEARD_CAT | 4 | Cat card (combo only) |
| CATTERMELON | 4 | Cat card (combo only) |
| RAINBOW_RALPHING_CAT | 4 | Cat card (combo only) |

Total: 56 cards.

## CardDefinition

Shape of each entry in `cards.json`. Loaded at startup, immutable at runtime.

| Field | Description |
|---|---|
| id | Unique identifier matching the JSON key (e.g. "attack", "tacocat") |
| type | CardType enum value |
| name | Display name |
| description | Card text shown to players |
| count | How many of this card exist in a full base deck |
| playable | Can be played as a standalone action. `false` for cat cards and EXPLODING_KITTEN |
| targetRequired | `true` for FAVOR. Also implicitly true for combos (pair/triple always need a target) |
| comboEligible | Can be used in a pair or triple combo. True for everything except EXPLODING_KITTEN |
| playableOutOfTurn | `true` only for NOPE. All other cards can only be played on your own turn |

## CardInstance

A physical card in an active game. Multiple instances can share the same definition (e.g. there are 4 Attack CardInstances, all referencing the same CardDefinition).

| Field | Description |
|---|---|
| instanceId | UUID, unique per physical card in this game session |
| definitionId | References `CardDefinition.id` |
| type | Denormalized from definition for fast access without a lookup |
