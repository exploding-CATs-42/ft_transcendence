import clsx from "clsx";

import s from "./Button.module.css";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

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
