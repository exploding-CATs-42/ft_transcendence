## How to add a new Action (it works the same with Guards)

Let’s say you want to add:

> `REMOVE_CARD`

---

## Step 1 — Define the action key

### `actions.ts`

```ts
export const PlayerActions = {
  ADD_CARD: "addCard",
  REMOVE_CARD: "removeCard", // NEW
} as const;
```

This is your **public contract identifier**.

---

## Step 2 — Add placeholder in the machine

### `playerMachine.ts`

```ts
actions: {
	[PlayerActions.ADD_CARD]: assign(() => ({})),
	[PlayerActions.REMOVE_CARD]: assign(() => ({})), // NEW
},
```

This is required so XState knows the action exists in the machine schema.

---

## Step 3 — Implement action in “me” strategy

### `me/actions.ts`

Add your implementation:

```ts
const removeCard = assign(({ context, event }: MyActionArgs) => {
  if (event.type !== PlayerEvents.REMOVE_CARD) return context;

  return {
    ...context,
    cards: context.cards.filter((c) => c.id !== event.cardId),
  };
});
```

Export it at the bottom of the file:

```ts
export default {
  addCard,
  removeCard, // NEW
};
```

---

## Step 4 — Implement action in “opponent” strategy

### `opponent/actions.ts`

```ts
const removeCard = assign(({ context, event }: OpponentActionArgs) => {
  return {
    cardCount: Math.max(0, context.cardCount - 1),
  };
});
```

Export it at the bottom of the file:

```ts
export default {
  addCard,
  removeCard, // NEW
};
```
