// Libraries
import clsx from "clsx";
// Local level
import s from "./Button.module.css";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button = ({ className, children, onClick, type, disabled }: Props) => {
  return (
    <button
      className={clsx(s.button, className)}
      type={type ?? "button"}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
