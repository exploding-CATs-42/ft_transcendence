# List

`List` is a generic component for rendering collections with a consistent scrollable list layout and an empty-state fallback.

## Component API

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `items` | `T[]` | Yes | Array of items to render. |
| `renderItem` | `(item: T) => React.ReactNode` | Yes | Function that renders each item. |
| `getKey` | `(item: T) => React.Key` | Yes | Function that returns a stable key for each item. |
| `className` | `string` | No | Adds custom classes on top of default list styles. |
| `empty` | `string` | No | Text displayed when `items` is empty. Default: `"No items"`. |

## Basic usage

```tsx
import { List, ListItem } from "components";

type User = {
  id: number;
  name: string;
};

const users: User[] = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" }
];

const UsersList = () => {
  return (
    <List
      items={users}
      getKey={(user) => user.id}
      renderItem={(user) => <ListItem>{user.name}</ListItem>}
      empty="No users found"
    />
  );
};

export default UsersList;
```

## Usage with custom styles

```tsx
import { List, ListItem } from "components";
import s from "./UsersPage.module.css";

type User = {
  id: number;
  name: string;
};

const users: User[] = [];

const UsersPage = () => {
  return (
    <List
      className={s.usersList}
      items={users}
      getKey={(item) => item.id}
      renderItem={(item) => <ListItem>{item.name}</ListItem>}
      empty="There are no users yet"
    />
  );
};

export default UsersPage;
```

```css
/* UsersPage.module.css */
.usersList {
  max-height: 480px;
  padding-right: 8px;
}
```

## Notes

- `renderItem` should return list elements (for example `ListItem`) to keep valid HTML structure inside the `<ul>`.
- Keep `getKey` stable and unique to avoid unnecessary re-renders.
