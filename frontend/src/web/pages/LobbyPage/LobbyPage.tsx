import { Section, Button, List, MatchListItem } from "components";
import s from "./LobbyPage.module.css";
import type { LobbyPage } from "./types";
import { lobbyPageMock } from "./mocks";

const LobbyPage = () => {
  const data = lobbyPageMock;

  return (
    <div className={s.pageContainer}>
      <Section className={s.listSection}>
        <List
          items={data.matches}
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
