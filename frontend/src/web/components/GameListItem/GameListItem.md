# GameListItem

`GameListItem` renders one lobby table row with a title and a fixed number of
player slots.

## Component API

| Prop   | Type        | Required | Description                                                         |
| ------ | ----------- | -------- | ------------------------------------------------------------------- |
| `game` | `LobbyGame` | Yes      | Game data used to render the table title and occupied player slots. |

`LobbyGame` shape:

```ts
type LobbyPlayer = {
  id: string;
  avatarUrl: string;
};

type LobbyGame = {
  id: string;
  title: string;
  players: LobbyPlayer[];
};
```

## Render behavior

- The component always renders a fixed number of slots via `createGameSlots`
  from `slots.ts`.
- Current max slot count is `5` (`MAX_PLAYERS` constant in `slots.ts`).
- Real players render an `Avatar` with `variant="game"`.
- Empty slots render a placeholder circle (`data-placeholder="true"`).

## Basic usage

```tsx
import { GameListItem } from "components";
import type { LobbyGame } from "types";

const game: LobbyGame = {
  id: "table-1",
  title: "Cat Clash #1",
  players: [
    { id: "p1", avatarUrl: "/avatars/p1.png" },
    { id: "p2", avatarUrl: "/avatars/p2.png" },
  ],
};

const GameRow = () => {
  return <GameListItem game={game} />;
};

export default GameRow;
```

## Typical usage with List

```tsx
import { List, GameListItem } from "components";
import type { LobbyGame } from "types";

type Props = {
  games: LobbyGame[];
};

const GamesList = ({ games }: Props) => {
  return (
    <List
      items={games}
      getKey={(game) => game.id}
      renderItem={(game) => <GameListItem game={game} />}
      empty="No games yet"
    />
  );
};

export default GamesList;
```

## Notes

- This component already wraps content in `ListItem`, so it is intended to be
  rendered inside `List` via `renderItem`.
- Slot metadata types are defined in `types.ts` (`GameSlot`, `LobbyGame`,
  `LobbyPlayer`).
- Placeholder styling is controlled by `GameListItem.module.css` using the
  `data-placeholder` attribute.
