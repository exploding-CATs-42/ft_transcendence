// Libraries
import { useState } from "react";
//Project level
import { Button, List, GameListItem, SearchInput, Section } from "components";
// Local level
import { FriendListItem, Tabs } from "../../components";
import type { TabOption, FriendItem } from "../../types";
import s from "./ListSection.module.css";
import type { UserGameHistoryItem } from "components/GameListItem/types";

interface Props {
  games: UserGameHistoryItem[];
  friends: FriendItem[];
}

export type ActiveTab = "games" | "friends";

const tabs: TabOption[] = [
  { key: "games", label: "Last games" },
  { key: "friends", label: "Friends" },
];

const ListSection = ({ games, friends }: Props) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("games");

  const sortedFriends = [...friends].sort((a, b) => {
    const statusOrder = {
      ACCEPTED: 0,
      PENDING: 1,
      REJECTED: 2,
    };

    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[b.status] - statusOrder[a.status];
    }
    return a.user.username.localeCompare(b.user.username);
  });

  return (
    <Section className={s.section}>
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(tab) => setActiveTab(tab as ActiveTab)}
      />

      {activeTab === "friends" ? (
        <>
          <List
            items={sortedFriends}
            getKey={(friend) => friend.user.id}
            renderItem={(friend) => <FriendListItem friend={friend} />}
            className={s.list}
            empty="No friends yet"
          />
          <div className={s.footer}>
            <SearchInput />
            <Button className={s.button}>Add</Button>
          </div>
        </>
      ) : (
        <List
          items={games}
          getKey={(game) => game.gameId}
          renderItem={(game) => <GameListItem game={game} />}
          className={s.list}
          empty="No games yet"
        />
      )}
    </Section>
  );
};

export default ListSection;
