// Project level
import { Avatar, Icon, LinkButton, ListItem } from "components";
// Local level
import { createGameSlots, isPlaceholderSlot } from "./slots";
import type { LobbyGame, GameSlot } from "./types";
import s from "./GameListItem.module.css";

interface Props {
  game: LobbyGame;
  isCurrentLobby?: boolean;
  onManageCurrentLobby?: () => void;
}

const GameListItem = ({
  game,
  isCurrentLobby = false,
  onManageCurrentLobby,
}: Props) => {
  const slots: GameSlot[] = createGameSlots(game.players);

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
          <span className={s.title}>{game.gameName}</span>

          {isCurrentLobby && (
            <span className={s.currentLobbyLabel}>current lobby</span>
          )}
        </div>

        <div className={s.actionsContainer}>
          <ul className={s.items}>
            {slots.map((slot, index) =>
              renderSlot(slot, `${game.gameId}_${index}`),
            )}
          </ul>

          {isCurrentLobby && (
            <button
              type="button"
              className={s.manageLobbyButton}
              onClick={handleManageCurrentLobbyClick}
              aria-label="Manage current lobby"
            >
              <Icon
                className={s.trashIcon}
                name="trash-can"
                width={18}
                height={18}
              />
            </button>
          )}
        </div>
      </div>
    </ListItem>
  );
};

const renderSlot = (slot: GameSlot, key: string) => {
  const isPlaceholder = isPlaceholderSlot(slot);

  const item = (
    <li key={key} data-placeholder={isPlaceholder} className={s.item}>
      {!isPlaceholder && (
        <Avatar
          className={s.avatar}
          variant="game"
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

export default GameListItem;
