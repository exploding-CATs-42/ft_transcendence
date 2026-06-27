### **Server-authoritative approach**

- The server holds the full ground truth (deck order, all hands)
- Clients hold _only what they're allowed to see_
- The server sends **events** — but only the slice each client is permitted to
  observe

So clients never determine the **final** game state themselves (they might
determine their own state, but it's never _final_) - they tell the server what
they want to do, then the server decides the final state, and sends the result
back to the client, so that they could react to it and render the outcome

- **Cheating becomes impossible** whereas with the "client owns the truth"
  approach a hacked client could inspect memory to see the full deck or other
  players' hands
- **Nope timing is cleaner** — the server can authoritatively resolve
  simultaneous Nopes without clients disagreeing

### State machines on both ends? Same or different?

You'd have **two different machines**, serving different purposes:

**Server state machine** is the **authoritative game logic** machine. It knows
everything — full deck order, all hands, all hidden state. It validates every
action, transitions itself, and decides what events to emit to whom.

**Client state machine** is a **UI/interaction machine**. It doesn't run _full_
game logic — it tracks what _this player_ is allowed to see and do right now. It
drives what's rendered and what inputs are enabled.

They will **not** be the same machine, and **shouldn't** be. The server machine
is the _source of truth_; the client machine is a _projection_ of it,
**filtered** through what that **specific player** can observe. They may and
will share some state names and even some transition logic, since frontend state
machine is a "slice" of the backend state machine. But conceptually they're
doing different jobs.

### Playing a card, step by step

**1. Player taps a card in the GUI**

The GUI doesn't talk to the server directly. It dispatches an intent to the
**client state machine**:  
`{ type: "CARD_SELECTED", card: "attack" }`.

The client machine checks if this is legal _from a UI perspective_ (is it your
turn? are you in `Idle` state?). If yes, it transitions to `WaitingForAck` and
instructs the GUI to show the card as "pending" — slightly greyed out, maybe
animating toward the play pile.

**2. Client sends action over WebSocket**

The client machine emits an action to the server:

```json
{ "type": "PLAY_CARD", "card": "attack" }
```

The client is now in `WaitingForAck`. The GUI reflects this — inputs disabled,
card in-flight.

**3. Server receives the action**

The server validates it against its own state machine:

- Is it this player's turn?
- Do they actually have this card in hand?
- Is the game in a state where playing is legal?

If invalid, it sends back an error event and the client machine rolls back to
`Idle`. If valid, the server machine transitions and starts computing
consequences.

**4. Server emits filtered events**

The server doesn't send one message — it sends **different messages to different
players**. For an Attack card:

To **all players**:

```json
{ "type": "CARD_PLAYED", "player": "alice", "card": "attack" }
```

To **the next player** (who now must draw twice):

```json
{ "type": "YOUR_TURN", "drawsRequired": 2 }
```

To **alice** (confirmation + hand update):

```json
{ "type": "HAND_UPDATED", "hand": ["defuse", "skip", ...] }
```

Each event is the minimum information that player is entitled to know.

**5. Each client's state machine receives its events**

Alice's machine gets `CARD_PLAYED` + `HAND_UPDATED` → transitions to
`WaitingForOpponent`, GUI removes the card from her hand and animates it to the
pile.

Bob's machine gets `CARD_PLAYED` + `YOUR_TURN` → transitions to `MustDraw`, GUI
highlights the deck and shows "Draw 2".

Other players' machines get just `CARD_PLAYED` → stay in `WaitingForTurn`, GUI
shows the card hitting the pile.

**6. GUI is a pure function of client machine state**

At every point the GUI just renders whatever the client machine says. It never
makes decisions. The machine says `WaitingForAck` → disable all inputs. The
machine says `MustDraw` → highlight deck. The machine says `ViewingFuture` →
show the top 3 cards overlay. This is the clean separation that makes the UI
straightforward to build and test.

---

#### What about Nope?

This is where the model really shines. After step 4, before the server
transitions fully, it enters `WaitingForNope` for a short window (say 3
seconds). During this window:

- All other players' client machines receive a `NOPE_WINDOW_OPEN` event and
  transition to `CanNope` — their Nope card lights up if they have one
- If someone plays Nope, the server machine handles it, possibly opens another
  Nope window (Nope the Nope), and eventually resolves
- The server is the sole arbiter of timing — clients never have to agree with
  each other about whether a Nope was "in time"

This is the clearest example of why server-authoritative beats deterministic for
this game: simultaneous reactions from multiple players are resolved in one
place, with no possibility of clients disagreeing.

# Additional info

### Option C — A coordinator/glue layer holds both

_Neither knows about the other (it's about Graphics and State Machine). A third
thing observes the machine and commands the view._

This is the right approach, and it has a name: **the observer pattern**, or in
UI frameworks, it often just looks like a component or a controller.

The glue layer:

- Owns (or has references to) both the machine and the GraphicHand
- Listens to state machine output (state changes or emitted events)
- Translates them into calls on GraphicHand
- Forwards raw user input from GraphicHand upward to the machine

```
User click
    ↓
GraphicHand  ──(callback/event)──→  Coordinator  ──.send()──→  StateMachine
                                         ↑                            ↓
                                    listens to               emits new state
                                    state changes                     ↓
                                         └──────────────────  Coordinator
                                                                      ↓
                                                          graphicHand.addCard()
```

GraphicHand becomes completely dumb — it knows how to render and animate, it
fires a raw callback when clicked ("I was clicked"), and it exposes imperative
methods like `addCard()`. It knows nothing about state machines or game logic.

The machine is also completely dumb about rendering — pure logic, pure
transitions, no graphics references.

The coordinator is the only place that knows about both. It's the translation
layer.
