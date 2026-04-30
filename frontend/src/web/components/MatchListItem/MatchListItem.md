# MatchListItem

`MatchListItem` renders one lobby table row with a title and a fixed number of
player slots.

## Component API

| Prop    | Type         | Required | Description                                                          |
| ------- | ------------ | -------- | -------------------------------------------------------------------- |
| `match` | `LobbyMatch` | Yes      | Match data used to render the table title and occupied player slots. |

`LobbyMatch` shape:

```ts
type LobbyPlayer = {
  id: string;
  avatarUrl: string;
};

type LobbyMatch = {
  id: string;
  title: string;
  players: LobbyPlayer[];
};
```

## Render behavior

- The component always renders a fixed number of slots via `createMatchSlots`
  from `slots.ts`.
- Current max slot count is `5` (`MAX_PLAYERS` constant in `slots.ts`).
- Real players render an `Avatar` with `variant="match"`.
- Empty slots render a placeholder circle (`data-placeholder="true"`).

## Basic usage

```tsx
import { MatchListItem } from "components";
import type { LobbyMatch } from "components/MatchListItem/types";

const match: LobbyMatch = {
  id: "table-1",
  title: "Cat Clash #1",
  players: [
    { id: "p1", avatarUrl: "/avatars/p1.png" },
    { id: "p2", avatarUrl: "/avatars/p2.png" }
  ]
};

const MatchRow = () => {
  return <MatchListItem match={match} />;
};

export default MatchRow;
```

## Typical usage with List

```tsx
import { List, MatchListItem } from "components";
import type { LobbyMatch } from "components/MatchListItem/types";

type Props = {
  matches: LobbyMatch[];
};

const MatchesList = ({ matches }: Props) => {
  return (
    <List
      items={matches}
      getKey={(match) => match.id}
      renderItem={(match) => <MatchListItem match={match} />}
      empty="No matches yet"
    />
  );
};

export default MatchesList;
```

## Notes

- This component already wraps content in `ListItem`, so it is intended to be
  rendered inside `List` via `renderItem`.
- Slot metadata types are defined in `types.ts` (`MatchSlot`, `LobbyMatch`,
  `LobbyPlayer`).
- Placeholder styling is controlled by `MatchListItem.module.css` using the
  `data-placeholder` attribute.
