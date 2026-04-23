import { Section, Button, List, MatchListItem } from "components";
import type { LobbyMatch } from "components/MatchListItem/types";

import { matchesMock } from "./mocks";

import s from "./LobbyPage.module.css";

const LobbyPage = () => {
  const matches: LobbyMatch[] = matchesMock;

  return (
    <div className={s.pageContainer}>
      <Section className={s.listSection}>
        <List
          items={matches}
          getKey={(match) => match.id}
          renderItem={(match) => <MatchListItem match={match} />}
          className={s.list}
        />
        <Footer />
      </Section>
    </div>
  );
};

const Footer = () => {
  return (
    <div className={s.footer}>
      <Button className={s.button}>Create table</Button>
      <Button className={s.button}>Join table</Button>
    </div>
  );
};

export default LobbyPage;
