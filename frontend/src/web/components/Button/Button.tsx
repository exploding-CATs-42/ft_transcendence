import { type ReactNode } from "react";
import clsx from "clsx";

import s from "./Button.module.css";

interface Props {
  className?: string;
  children?: ReactNode;
}

const Button = ({ className, children }: Props) => {
  return (
    <button className={clsx(s.button, className)} type="button">
      {children}
    </button>
  );
};

export default Button;
