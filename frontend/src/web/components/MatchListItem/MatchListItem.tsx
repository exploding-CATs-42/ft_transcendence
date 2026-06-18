// Project level
import { Avatar, Icon, LinkButton, ListItem } from "components";
// Local level
import { createMatchSlots, isPlaceholderSlot } from "./slots";
import type { LobbyMatch, MatchSlot } from "./types";
import s from "./MatchListItem.module.css";

interface Props {
  match: LobbyMatch;
  isCurrentLobby?: boolean;
  onManageCurrentLobby?: () => void;
}

const MatchListItem = ({
  match,
  isCurrentLobby = false,
  onManageCurrentLobby,
}: Props) => {
  const slots: MatchSlot[] = createMatchSlots(match.players);

  const handleManageCurrentLobbyClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    onManageCurrentLobby?.();
  };

  return (
    <ListItem>
      <div className={s.container}>
        <div className={s.titleContainer}>
          <span className={s.title}>{match.gameName}</span>

          {isCurrentLobby && (
            <span className={s.currentLobbyLabel}>current lobby</span>
          )}
        </div>

        <div className={s.actionsContainer}>
          <ul className={s.items}>
            {slots.map((slot, index) =>
              renderSlot(slot, `${match.gameId}_${index}`),
            )}
          </ul>

          {isCurrentLobby && (
            <button
              type="button"
              className={s.manageLobbyButton}
              onClick={handleManageCurrentLobbyClick}
              aria-label="Manage current lobby"
            >
              <Icon name="trash-can" width={18} height={18} fill="#fcf8ee" />
            </button>
          )}
        </div>
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
