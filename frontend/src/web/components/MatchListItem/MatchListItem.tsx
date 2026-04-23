import { Avatar, ListItem } from "components";

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
          {slots.map((slot, index) => (
            <li
              key={`${match.id}_${index}`}
              data-placeholder={isPlaceholderSlot(slot)}
              className={s.item}
            >
              {!isPlaceholderSlot(slot) && (
                <Avatar
                  className={s.avatar}
                  variant="match"
                  src={slot.player.avatarUrl}
                />
              )}
            </li>
          ))}
        </ul>
      </div>
    </ListItem>
  );
};

export default MatchListItem;
