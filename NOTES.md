### The structure

Create a `controllers/` folder inside `src/game/`:

```
src/game/
├── controllers/
│   ├── HandController.ts       ← the glue for GraphicHand ↔ PlayerMachine
│   ├── OpponentHandController.ts   ← same idea for opponent hands
│   └── index.ts
├── entities/
├── scenes/
│   └── GameRoom.ts             ← becomes a thin orchestrator
...
```

Each controller owns one machine + one (or more) graphic entity. `GameRoom`
creates and holds controllers, not raw graphic entities directly.

---

### Why is it called `controllers/`?

**Controller** is the right word for "thing that observes state and commands a
view". It comes from the `MVC pattern` and is used this way in game dev as well
(Phaser and Xstate docs use this term as well)

⚠️ Side note ⚠️

In `Express.js` "**controller**" means **request handler**  
while in `MVC pattern` "**controller**" means "the component that mediates
**between** the **Model** and the **View**."

---

### What `HandController` looks like conceptually

```ts
// controllers/HandController.ts
export class HandController {
  #machine: ActorRef<PlayerMachine>;
  #view: GraphicHand;

  constructor(machine: ActorRef<PlayerMachine>, view: GraphicHand) {
    this.#machine = machine;
    this.#view = view;

    // Observe state → command view
    this.#machine.subscribe((state) => {
      this.#syncView(state);
    });

    // Forward raw input → machine
    this.#view.onCardClicked = (index) => {
      this.#machine.send({ type: "CARD_CLICKED", index });
    };
  }

  private #syncView(state: StateFrom<PlayerMachine>) {
    if (state.matches("drawing")) {
      // this.#view.addCard(...)
    }
  }
}
```

`GameRoom` then just does:

```ts
this.#handController = new HandController(playerActor, this.#myHand);
```

---

### What stays in `GameRoom`

- Scene lifecycle (`create`, `shutdown`)
- Layout constants
- Instantiating everything (graphic entities, machines, controllers)

It becomes a wiring board, not a logic layer.

### Controller wires its own sockets

The controller knows about both the machine and the socket:

```ts
// controllers/HandController.ts
constructor(machine, view, socket) {
  socket.on('cards:dealt', (hand) => {
    machine.send({ type: 'CARDS_DEALT', cards: hand.cards })
  })

  machine.subscribe((state) => { /* → view */ })
}
```

## Communication flow

### Backend -> Frontend

```
State on backend changes (io.emit)
    ↓
Frontend receives the socket event (socket.on)
    ↓
Sends it to the Model (machine.send)
    ↓
State on frontend changes (machine.emit)
    ↓
Controller observes (machine.on)
    ↓
View updates
```

### Frontend -> Backend

#### Optimistic approach (better, but harder)

```
Client clicks on a card (card.on("pointerdown"))
    ↓
Callback fires (onClick = (card) => {// do something})
    ↓
Event is sent to the machine (machine.send)
    ↓
State changes (machine.emit)
    ↓
Controller observes (machine.on)
    ↓                        ↓
View updates          Event is sent to backend (socket.emit)
```

**Pros**: quick response  
**Cons**: if backend rejects our event (which I think shouldn't happen unless we
are cheating, but I might be missing something) we would need to roll back.
Meaning we would need to implement a rollback mechanism.

#### Lazy approach (easier, but worse)

```
Client clicks on a card (card.on("pointerdown"))
    ↓
Callback fires (onClick = (card) => {// do something})
    ↓
Event is sent to the backend (socket.emit)
    ↓
State on backend changes (io.emit)
    ↓
Frontend receives response (socket.on)
    ↓
Sends the event to Model (machine.send)
    ↓
State on frontend changes (machine.emit)
    ↓
Controller observes (machine.on)
    ↓
View updates
```

**Pros**: no rollback mechanism is needed  
**Cons**: the game might feel laggy (although considering that we will be
evaluating in a local network I think we won't notice it)
