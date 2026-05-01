import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";

import s from "./LinkButton.module.css";

interface Props {
  className?: string;
  children?: ReactNode;
  to: string;
}

const LinkButton = ({ to, className = "", children }: Props) => {
  return (
    <Link className={clsx(s.button, className)} to={to}>
      {children}
    </Link>
  );
};

export default LinkButton;
