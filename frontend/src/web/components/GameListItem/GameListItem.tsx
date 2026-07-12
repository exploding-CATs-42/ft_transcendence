// Project level
import { Avatar, LinkButton, ListItem } from "components";
// Local level
import { createGameSlots, isPlaceholderSlot } from "./slots";
import type { GameListItemData, GameSlot, LobbyGame } from "./types";
import s from "./GameListItem.module.css";

interface Props {
  game: GameListItemData;
}

const GAME_HISTORY_SLOT_COUNT = 5;

const isLobbyGame = (game: GameListItemData): game is LobbyGame => {
  return "maxPlayers" in game;
};

const GameListItem = ({ game }: Props) => {
  const gameId = isLobbyGame(game) ? game.id : game.gameId;
  const gameName = isLobbyGame(game) ? game.name : game.gameName;
  const slotCount = isLobbyGame(game)
    ? game.maxPlayers
    : GAME_HISTORY_SLOT_COUNT;
  const slots: GameSlot[] = createGameSlots(game.players, slotCount);

  return (
    <ListItem>
      <div className={s.container}>
        <span className={s.title}>{gameName}</span>
        <ul className={s.items}>
          {slots.map((slot, index) => renderSlot(slot, `${gameId}_${index}`))}
        </ul>
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
          variant="game"
          src={slot.player.avatarUrl}
          status={slot.player.isOnline}
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
