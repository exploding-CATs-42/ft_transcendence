import type { UserGameHistoryItem } from "components/GameListItem/types";
import s from "./GamesTab.module.css";
import { GameListItem, List } from "components";

interface Props {
  games: UserGameHistoryItem[];
}

const GamesTab = ({ games }: Props) => {
  return (
    <>
      <List
        items={games}
        getKey={(game) => game.gameId}
        renderItem={(game) => <GameListItem game={game} />}
        className={s.list}
        empty="No games yet"
      />
    </>
  );
};

export default GamesTab;
