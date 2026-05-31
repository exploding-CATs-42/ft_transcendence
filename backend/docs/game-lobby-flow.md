# Game Lobby Flow

How players go from joining a lobby to starting a game.

## States

```
waiting
 ├─ confirming   ← players join and toggle readiness here
 └─ starting     ← countdown is running
playing          ← game has begun
```

## The flow

1. **Create** — A game is created with an actor that starts in `waiting.confirming`.

2. **Join** — Client emits `join-game`. The player is added (`isConfirmed: false`),
   the socket joins the game's room, and `player-joined` is broadcast with the
   updated player list.

3. **Confirm** — Each player emits `confirm-start`, flipping their own `isConfirmed`
   to `true`. Server broadcasts `player-confirmed`. (`cancel-start` flips it back.)

4. **Auto-start check** — After every change the machine checks a guard:
   **≥ 2 players AND everyone confirmed**. When true, it moves itself to `starting`.

5. **Countdown** — Entering `starting` broadcasts `countdown-started` with an `endsAt`
   timestamp, so clients can show a 10-second timer.

6. **Abort** — If anyone joins, leaves, or hits `cancel-start` during the countdown,
   the machine drops back to `confirming` and broadcasts `countdown-canceled`.

7. **Start** — If the countdown finishes uninterrupted, the machine enters `playing`
   and broadcasts `game-started`.

8. **Leave** — `leave-game` removes the player and leaves the room. If the last player
   leaves, the game is deleted.

## Events

| Client sends     | Server broadcasts to room                          |
|------------------|----------------------------------------------------|
| `join-game`      | `player-joined`                                    |
| `leave-game`     | `player-left` (+ `you-left` to the leaver only)    |
| `confirm-start`  | `player-confirmed`                                 |
| `cancel-start`   | `player-canceled`                                  |
| —                | `countdown-started` / `countdown-canceled`         |
| —                | `game-started`                                     |

## Code structure

```
backend/src/
├─ sockets/
│  ├─ game.ts            ← (1) socket handlers: receive client events, broadcast results
│  └─ setup.ts           ←     wires the broadcaster to the io server
├─ services/
│  └─ gameService.ts     ← (2) join/leave/confirm/cancel: validate, send event to actor
├─ game/
│  ├─ gameMachine.ts     ← (3) the state machine (states, transitions, guard) — start here
│  ├─ events.ts          ←     events the machine accepts (JOIN_GAME, CONFIRM_START, …)
│  ├─ actions.ts         ←     how the player list changes on each event
│  ├─ guards.ts          ←     canEnterStarting: ≥2 players AND all confirmed
│  ├─ emitters.ts        ←     events the machine emits (countdown / game-started)
│  ├─ broadcaster.ts     ← (4) turns emitted events into room broadcasts
│  ├─ mappers.ts         ←     Player → WaitingPlayerView (what clients see)
│  └─ types.ts           ←     Player, Game, GameInfo
├─ types/events.ts       ←     all socket event names + payload shapes
├─ schemas/games/        ←     Zod validation for each client event
└─ constants/game.ts     ←     MIN_PLAYERS, START_GAME_COUNTDOWN_MS
```

**Request lifecycle** — there are two ways the client hears back:

```
client event
   → game.ts handler
   → gameService.ts (validate)
   → actor.send(event)
   → gameMachine.ts updates state
        │
        ├─ (a) direct reply: handler broadcasts the result itself
        │       e.g. player-joined / player-left / player-confirmed / player-canceled
        │
        └─ (b) machine emit: state change triggers an emitter
                → broadcaster.ts broadcasts it
                e.g. countdown-started / countdown-canceled / game-started
```

Path (a) is the normal player-list updates the handler sends right after the service
returns. Path (b) is only for things the machine decides on its own (the countdown
starting/aborting and the game starting) — those go through `broadcaster.ts`.
