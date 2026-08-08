// Libraries
import clsx from "clsx";
// Project level
import {
  getExplodedTimes,
  getSuccessRate,
  type LeaderboardEntry,
} from "@exploding-cats/contracts";
import { Crown } from "assets";
import { Avatar, LinkButton, List, ListItem } from "components";
// Local level
import s from "./LeaderboardTable.module.css";

interface Props {
  entries: LeaderboardEntry[];
}

interface StatCellProps {
  label: string;
  value: number | string;
}

const TOP_RANK = 1;

const PLAYER_COLUMN = "Player";
const RANK_COLUMN = "#";

const COLUMNS = [
  RANK_COLUMN,
  PLAYER_COLUMN,
  "Games played",
  "Games won",
  "Exploded times",
  "Success rate",
];

const StatCell = ({ label, value }: StatCellProps) => {
  return (
    <span className={s.cell}>
      <span className="visually-hidden">{label}: </span>
      {value}
    </span>
  );
};

const LeaderboardTable = ({ entries }: Props) => {
  const hasEntries = entries.length > 0;

  return (
    <div className={s.scrollContainer}>
      {hasEntries && (
        <div className={s.headerRow} aria-hidden="true">
          {COLUMNS.map((column) => (
            <span
              key={column}
              className={clsx(
                s.headerCell,
                column === PLAYER_COLUMN && s.playerHeader,
                column === RANK_COLUMN && s.countHeader,
              )}
            >
              {column}
            </span>
          ))}
        </div>
      )}

      <List
        items={entries}
        getKey={(entry) => entry.id}
        className={clsx(s.list, hasEntries && s.listColumns)}
        empty="No players yet..."
        renderItem={(entry) => (
          <ListItem
            className={clsx(s.row, entry.rank === TOP_RANK && s.topRow)}
          >
            <span className={s.rank}>
              {entry.rank}
              {entry.rank === TOP_RANK && (
                <img className={s.crown} src={Crown} alt="Leader" />
              )}
            </span>

            <LinkButton to={`/users/${entry.id}`} className={s.player}>
              <Avatar
                variant="friend"
                src={entry.avatarUrl}
                alt={`${entry.username} avatar`}
                status={entry.isOnline}
                className={s.avatar}
              />
              <span className={s.username}>{entry.username}</span>
            </LinkButton>

            <StatCell label="Games played" value={entry.totalGames} />
            <StatCell label="Games won" value={entry.wins} />
            <StatCell label="Exploded times" value={getExplodedTimes(entry)} />
            <StatCell
              label="Success rate"
              value={`${getSuccessRate(entry)}%`}
            />
          </ListItem>
        )}
      />
    </div>
  );
};

export default LeaderboardTable;
