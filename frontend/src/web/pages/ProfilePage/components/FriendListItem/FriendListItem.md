# FriendListItem

`FriendListItem` renders one friend row with avatar, username, online status text, and two action buttons.

## Component API

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `friend` | `FriendItem` | Yes | Friend data used to render avatar, name, and online/offline status. |

`FriendItem` shape:

```ts
type FriendItem = {
  id: string;
  username: string;
  avatarUrl: string;
  isOnline: boolean;
};
```

## Render behavior

- The component wraps its content in `ListItem`, so it renders as a list row.
- Avatar is rendered with `variant="friend"` and `alt` text based on username.
- Status text is derived from `isOnline` and shown as `online` or `offline`.
- Two buttons are rendered: `Accept` and `Ignore`.

## Basic usage

```tsx
import { FriendListItem } from "components";
import type { FriendItem } from "components/FriendListItem/FriendListItem";

const friend: FriendItem = {
  id: "f-1",
  username: "Sasha",
  avatarUrl: "/avatars/sasha.png",
  isOnline: true
};

const FriendRow = () => {
  return <FriendListItem friend={friend} />;
};

export default FriendRow;
```

## Typical usage with List

```tsx
import { FriendListItem, List } from "components";
import type { FriendItem } from "components/FriendListItem/FriendListItem";

type Props = {
  friends: FriendItem[];
};

const FriendsList = ({ friends }: Props) => {
  return (
    <List
      items={friends}
      getKey={(friend) => friend.id}
      renderItem={(friend) => <FriendListItem friend={friend} />}
      empty="No friends yet"
    />
  );
};

export default FriendsList;
```

## Notes

- `FriendListItem` is currently presentational; button clicks are not handled via props.
- To add actions, extend `Props` with callback handlers and pass them from the parent list container.
