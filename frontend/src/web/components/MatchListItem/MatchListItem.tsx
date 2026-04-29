import { Avatar, LinkButton, ListItem } from "components";

import { createMatchSlots, isPlaceholderSlot } from "./slots";
import type { LobbyMatch, MatchSlot } from "./types";

import s from "./MatchListItem.module.css";

interface Props {
  match: LobbyMatch;
}

const MatchListItem = ({ match }: Props) => {
  const slots: MatchSlot[] = createMatchSlots(match.players);

  return (
    <ListItem>
      <div className={s.container}>
        <span className={s.title}>{match.title}</span>
        <ul className={s.items}>
          {slots.map((slot, index) => renderSlot(slot, `${match.id}_${index}`))}
        </ul>
      </div>
    </ListItem>
  );
};

const renderSlot = (slot: MatchSlot, key: string) => {
  const isPlaceholder = isPlaceholderSlot(slot);

  const item = (
    <li key={key} data-placeholder={isPlaceholder} className={s.item}>
      {!isPlaceholder && (
        <Avatar
          className={s.avatar}
          variant="match"
          src={slot.player.avatarUrl}
        />
      )}
    </li>
  );

  return isPlaceholder ? (
    item
  ) : (
    <LinkButton key={key} to={`/users/${slot.player.id}`}>
      {item}
    </LinkButton>
  );
};

export default MatchListItem;
