import { useState } from "react";

import { Button, List, MatchListItem, SearchInput, Section } from "components";

import type { LobbyMatch } from "components/MatchListItem/types";

import Tabs, { type TabOption } from "../Tabs/Tabs";

import FriendListItem, {
  type FriendItem
} from "../FriendListItem/FriendListItem";

import s from "./ListSection.module.css";

interface Props {
  matches: LobbyMatch[];
  friends: FriendItem[];
}

export type ActiveTab = "matches" | "friends";

const tabs: TabOption[] = [
  { key: "matches", label: "Last matches" },
  { key: "friends", label: "Friends" }
];

const ListSection = ({ matches, friends }: Props) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("matches");

  return (
    <Section className={s.section}>
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(tab) => setActiveTab(tab as ActiveTab)}
      />

      {activeTab === "friends" ? (
        <List
          items={friends}
          getKey={(friend) => friend.id}
          renderItem={(friend) => <FriendListItem friend={friend} />}
          className={s.list}
          empty="No friends yet"
        />
      ) : (
        <List
          items={matches}
          getKey={(match) => match.id}
          renderItem={(match) => <MatchListItem match={match} />}
          className={s.list}
          empty="No matches yet"
        />
      )}

      <div className={s.footer}>
        <SearchInput />
        <Button className={s.button}>Add</Button>
      </div>
    </Section>
  );
};

export default ListSection;
