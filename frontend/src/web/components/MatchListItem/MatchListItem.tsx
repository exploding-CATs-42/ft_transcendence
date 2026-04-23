import { Avatar, ListItem } from "components";

import type { LobbyMatch } from "./types";
import s from "./MatchListItem.module.css";

interface Props {
  match: LobbyMatch;
}

const MatchListItem = ({ match }: Props) => {
  const players = match.players;

  return (
    <ListItem>
      <div className={s.container}>
        <span className={s.title}>{match.title}</span>
        <ul className={s.items}>
          {players.map((player) => (
            <li key={player.id}>
              <Avatar variant="match" src={player.avatarUrl} />
            </li>
          ))}
        </ul>
      </div>
    </ListItem>
  );
};

export default MatchListItem;
