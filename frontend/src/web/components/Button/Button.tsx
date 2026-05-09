// Libraries
import clsx from "clsx";
// Local level
import s from "./Button.module.css";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement>;

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
