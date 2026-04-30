# Section

`Section` is a layout wrapper component used to group content blocks with a
shared container style.

## Component API

| Prop        | Type              | Required | Description                                               |
| ----------- | ----------------- | -------- | --------------------------------------------------------- |
| `className` | `string`          | No       | Adds custom classes on top of the default section styles. |
| `children`  | `React.ReactNode` | No       | Content rendered inside the section container.            |

## Basic usage

```tsx
import { Section } from "components";

const ProfilePage = () => {
  return (
    <Section>
      <h2>Profile</h2>
      <p>Manage your account details here.</p>
    </Section>
  );
};

export default ProfilePage;
```

## Usage with custom styles

```tsx
import { Section } from "components";

import s from "./SettingsPage.module.css";

const SettingsPage = () => {
  return (
    <Section className={s.settingsSection}>
      <h2>Settings</h2>
      <p>Customize your preferences.</p>
    </Section>
  );
};

export default SettingsPage;
```

```css
/* SettingsPage.module.css */
.settingsSection {
  padding: 24px;
}
```

## Default visual behavior

`Section` always includes its base `.section` class, which currently applies:

- `display: flex`
- `position: relative`
- `border-radius: 40px`
- `border: 3px solid var(--throw-throw-burrito)`
- `background-color: var(--exploding-kittens)`
