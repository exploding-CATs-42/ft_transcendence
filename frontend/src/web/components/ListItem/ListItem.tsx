import clsx from "clsx";
import s from "./ListItem.module.css";

interface Props {
  className?: string;
	children? : React.ReactNode;
}

const ListItem = ({ className, children }: Props) => {
  return (
    <li className={clsx(s.item, className)}>
			{children}
    </li>
  );
};

export default ListItem;
