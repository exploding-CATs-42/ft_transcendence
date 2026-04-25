import clsx from "clsx";
import s from "./Tabs.module.css";

export type TabOption = {
  key: string;
  label: string;
}

interface Props {
  tabs: TabOption[];
  activeTab: string;
  onChange: (tab: string) => void;
  className?: string;
}

const Tabs = ({ tabs, activeTab, onChange, className }: Props) => {
  return (
    <div className={clsx(s.tabs, className)}>
      {tabs.map((tab) => (
        <button
          type="button"
          key={tab.key}
          className={clsx(s.tab, { [s.active]: activeTab == tab.key })}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
