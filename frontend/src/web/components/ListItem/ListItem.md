# ListItem

`ListItem` is a presentational wrapper around an `<li>` element used to keep list row styling consistent.

## Component API

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `className` | `string` | No | Adds custom classes on top of default item styles. |
| `children` | `React.ReactNode` | No | Content rendered inside the list item. |

## Basic usage

```tsx
import { ListItem } from "components";

const UserRow = () => {
  return <ListItem>Player One</ListItem>;
};

export default UserRow;
```

## Typical usage with List

```tsx
import { List, ListItem } from "components";

const users = [
  { id: 1, nickname: "cat_master" },
  { id: 2, nickname: "burrito_thrower" }
];

const UsersList = () => {
  return (
    <List
      items={users}
      getKey={(user) => user.id}
      renderItem={(user) => <ListItem>{user.nickname}</ListItem>}
    />
  );
};

export default UsersList;
```

## Usage with custom styles

```tsx
import { ListItem } from "components";
import s from "./UsersList.module.css";

const UserCard = ({ nickname }: { nickname: string }) => {
  return <ListItem className={s.userCard}>{nickname}</ListItem>;
};

export default UserCard;
```

```css
/* UsersList.module.css */
.userCard {
  padding: 16px 20px;
}
```
