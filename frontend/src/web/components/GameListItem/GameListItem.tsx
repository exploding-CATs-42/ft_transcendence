// Project level
import { Avatar, LinkButton, ListItem } from "components";
// Local level
import { createGameSlots, isPlaceholderSlot } from "./slots";
import type { LobbyGame, GameSlot } from "./types";
import s from "./GameListItem.module.css";

interface Props {
  game: LobbyGame;
}

const GameListItem = ({ game }: Props) => {
  const slots: GameSlot[] = createGameSlots(game.players);

  return (
    <ListItem>
      <div className={s.container}>
        <span className={s.title}>{game.gameName}</span>
        <ul className={s.items}>
          {slots.map((slot, index) =>
            renderSlot(slot, `${game.gameId}_${index}`),
          )}
        </ul>
      </div>
    </ListItem>
  );
};

const renderSlot = (slot: GameSlot, key: string) => {
  const isPlaceholder = isPlaceholderSlot(slot);

  const item = (
    <li key={key} data-placeholder={isPlaceholder} className={s.item}>
      {!isPlaceholder && <Avatar variant="game" src={slot.player.avatarUrl} />}
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
