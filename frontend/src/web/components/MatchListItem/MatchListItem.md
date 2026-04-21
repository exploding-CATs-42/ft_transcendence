# MatchListItem

`MatchListItem` renders one lobby match row, including match title and player avatars.

## Component API

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `match` | `LobbyMatch` | Yes | Match data used to render title and player avatars. |

`LobbyMatch` shape:

```ts
type LobbyMatch = {
  id: string;
  title: string;
  players: {
    id: string;
    avatarUrl: string;
  }[];
};
```

## Basic usage

```tsx
import { MatchListItem } from "components";
import type { LobbyMatch } from "pages/LobbyPage/types";

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
import type { LobbyMatch } from "pages/LobbyPage/types";

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

- This component already wraps content in `ListItem`, so it is intended to be rendered inside `List` via `renderItem`.
- Avatar rendering uses `Avatar` with `variant="match"`.
