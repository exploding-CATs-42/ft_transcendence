// Project level
import { Avatar, LinkButton, ListItem } from "components";
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
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 3.75C9 3.33579 9.33579 3 9.75 3H14.25C14.6642 3 15 3.33579 15 3.75V5H19.25C19.6642 5 20 5.33579 20 5.75C20 6.16421 19.6642 6.5 19.25 6.5H4.75C4.33579 6.5 4 6.16421 4 5.75C4 5.33579 4.33579 5 4.75 5H9V3.75Z"
                  fill="currentColor"
                />
                <path
                  d="M6.25 8C6.25 7.58579 6.58579 7.25 7 7.25H17C17.4142 7.25 17.75 7.58579 17.75 8V18.25C17.75 19.7688 16.5188 21 15 21H9C7.48122 21 6.25 19.7688 6.25 18.25V8ZM9.75 10.25C9.33579 10.25 9 10.5858 9 11V17.25C9 17.6642 9.33579 18 9.75 18C10.1642 18 10.5 17.6642 10.5 17.25V11C10.5 10.5858 10.1642 10.25 9.75 10.25ZM14.25 10.25C13.8358 10.25 13.5 10.5858 13.5 11V17.25C13.5 17.6642 13.8358 18 14.25 18C14.6642 18 15 17.6642 15 17.25V11C15 10.5858 14.6642 10.25 14.25 10.25Z"
                  fill="currentColor"
                />
              </svg>
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
