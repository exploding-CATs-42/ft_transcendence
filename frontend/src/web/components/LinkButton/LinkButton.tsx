import { Link, type LinkProps } from "react-router-dom";
import clsx from "clsx";

import s from "./LinkButton.module.css";

type Props = LinkProps;

const LinkButton = ({ className = "", children, ...rest }: Props) => {
  return (
    <Link {...rest} className={clsx(s.button, className)}>
      {children}
    </Link>
  );
};

export default LinkButton;
