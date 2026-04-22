import clsx from "clsx";

import s from "./Button.module.css";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const Button = ({ className, children, onClick, type }: Props) => {
  return (
    <button
      className={clsx(s.button, className)}
      type={type ?? "button"}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
