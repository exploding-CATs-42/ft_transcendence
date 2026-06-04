// Project level
import { Icon, Section } from "components";
// Local level
import type { ProfileStat } from "../../types";
import s from "./StatsSection.module.css";

interface Props {
  stats: ProfileStat[];
}

const StatsSection = ({ stats }: Props) => {
  return (
    <Section className={s.section}>
      <ul className={s.list}>
        {stats.map((stat) => (
          <li className={s.item} key={stat.id}>
            <Icon name={stat.icon} height={50} width={50} />
            <div className={s.flexContainer}>
              <span className={s.amount}>{stat.amount}</span>
              <span className={s.name}>{stat.name}</span>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
};

export default StatsSection;
