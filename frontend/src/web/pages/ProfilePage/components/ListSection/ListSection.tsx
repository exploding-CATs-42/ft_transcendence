// Libraries
import { useState } from "react";
//Project level
import { List, GameListItem, Section } from "components";
// Local level
import { Tabs } from "../../components";
import type { TabOption, FriendItem } from "../../types";
import s from "./ListSection.module.css";
import type { UserGameHistoryItem } from "components/GameListItem/types";
import FriendsTab from "../FriendsTab/FriendsTab";

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

  return (
    <Section className={s.section}>
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(tab) => setActiveTab(tab as ActiveTab)}
      />

      {activeTab === "friends" ? (
        <FriendsTab friends={friends}></FriendsTab>
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
