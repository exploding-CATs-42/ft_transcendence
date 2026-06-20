// Libraries
import { useState, type Dispatch, type SetStateAction } from "react";
//Project level
import { Section } from "components";
// Local level
import { Tabs, FriendsTab, GamesTab } from "../../components";
import type { TabOption, FriendItem } from "../../types";
import type { UserGameHistoryItem } from "components/GameListItem/types";
import s from "./ListSection.module.css";

interface Props {
  games: UserGameHistoryItem[];
  friends: FriendItem[];
  setFriends: Dispatch<SetStateAction<FriendItem[]>>;
  isMyProfile: boolean;
}

export type ActiveTab = "games" | "friends";

const tabs: TabOption[] = [
  { key: "games", label: "Last games" },
  { key: "friends", label: "Friends" },
];

const ListSection = ({ games, friends, setFriends, isMyProfile }: Props) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("games");

  return (
    <Section className={s.section}>
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(tab) => setActiveTab(tab as ActiveTab)}
      />

      {activeTab === "friends" ? (
        <FriendsTab
          friends={friends}
          setFriends={setFriends}
          isMyProfile={isMyProfile}
        ></FriendsTab>
      ) : (
        <GamesTab games={games}></GamesTab>
      )}
    </Section>
  );
};

export default ListSection;
