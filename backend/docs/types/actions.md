# actions.ts

## ClientActionType

All actions a client can send to the server.

| Value | When valid | Description |
|---|---|---|
| PLAY_CARD | Phase is ACTION, sender is current player | Play a single action card |
| PLAY_COMBO | Phase is ACTION, sender is current player | Play a matching pair or triple |
| PLAY_NOPE | Phase is NOPE_WINDOW, timer not expired, sender is alive with a Nope card | Interrupt the pending action |
| DRAW_CARD | Phase is ACTION, sender is current player | Draw from deck. Processed atomically by server |
| PLAY_DEFUSE | Phase is DEFUSE_PROMPT, sender is current player with a Defuse | Respond to Exploding Kitten |
| INSERT_KITTEN | Phase is INSERT_KITTEN, sender is current player | Choose where to reinsert the kitten |
| FAVOR_GIVE | Phase is FAVOR_SELECT, sender is the favor target | Give a card to the requester |

## Action Interfaces

| Interface | Fields | Notes |
|---|---|---|
| PlayCardAction | `cardInstanceId`, `targetPlayerId?` | targetPlayerId required for FAVOR |
| PlayComboAction | `cardInstanceIds`, `targetPlayerId`, `namedCardType?` | 2 cards = pair (random steal), 3 cards = triple (named steal). namedCardType required for triple |
| PlayNopeAction | `cardInstanceId` | |
| PlayDefuseAction | `cardInstanceId` | |
| InsertKittenAction | `positionIndex` | 0 = top of deck, `drawPile.length` = bottom. Server clamps out-of-range values |
| FavorGiveAction | `cardInstanceId` | Card from the target's own hand |
| DrawCardAction | (no fields) | |

## ClientAction

Union of all action interfaces. The `type` field is the discriminant, enabling TypeScript narrowing in switch statements:

```typescript
function handleAction(action: ClientAction) {
  switch (action.type) {
    case ClientActionType.PLAY_CARD:
      // TypeScript knows action has cardInstanceId and targetPlayerId here
      break;
    case ClientActionType.DRAW_CARD:
      // TypeScript knows action has no extra fields
      break;
  }
}
```
