// Project level
import { LoadingScreen, Section } from "components";
import { useLeaderboard } from "hooks";
// Local level
import { LeaderboardTable } from "./components";
import s from "./LeaderboardPage.module.css";

const LeaderboardPage = () => {
  const { entries, leaderboardLoading } = useLeaderboard();

  if (leaderboardLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className={s.pageContainer}>
      <Section className={s.tableSection}>
        <LeaderboardTable entries={entries} />
      </Section>
    </div>
  );
};

export default LeaderboardPage;
