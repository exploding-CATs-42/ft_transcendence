// Libraries
import { useState } from "react";
//Project level
import { Button, List, MatchListItem, SearchInput, Section } from "components";
// Local level
import { FriendListItem, Tabs } from "../../components";
import type { TabOption, FriendItem } from "../../types";
import s from "./ListSection.module.css";
import type { UserGameHistoryItem } from "components/MatchListItem/types";

interface Props {
  matches: UserGameHistoryItem[];
  friends: FriendItem[];
}

export type ActiveTab = "matches" | "friends";

const tabs: TabOption[] = [
  { key: "matches", label: "Last matches" },
  { key: "friends", label: "Friends" },
];

const ListSection = ({ matches, friends }: Props) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("matches");

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
          items={matches}
          getKey={(match) => match.gameId}
          renderItem={(match) => <MatchListItem match={match} />}
          className={s.list}
          empty="No matches yet"
        />
      )}
    </Section>
  );
};

export default ListSection;
