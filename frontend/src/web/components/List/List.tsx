import { Fragment } from "react";
import s from "./List.module.css";
import clsx from "clsx";

interface Props<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  getKey: (item: T) => React.Key;
  className?: string;
  empty?: string;
}

interface EmptyProps {
  title: string;
}

const List = <T,>({
  items,
  renderItem,
  getKey,
  className,
  empty
}: Props<T>) => {
  return (
    <ul className={clsx(s.list, className)}>
      {items.length ? (
        items.map((item) => (
          <Fragment key={getKey(item)}>{renderItem(item)}</Fragment>
        ))
      ) : (
        <Empty title={empty ?? "No items"} />
      )}
    </ul>
  );
};

const Empty = ({ title }: EmptyProps) => {
  return <li className={s.empty}>{title}</li>;
};

export default List;
