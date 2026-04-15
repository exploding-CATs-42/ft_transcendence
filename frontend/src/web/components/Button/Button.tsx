import { type MouseEventHandler, type ReactNode } from "react";
import clsx from "clsx";

import s from "./Button.module.css";

interface Props {
  className?: string;
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

const Button = ({ className, children, onClick }: Props) => {
  return (
    <button
      className={clsx(s.button, className)}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
