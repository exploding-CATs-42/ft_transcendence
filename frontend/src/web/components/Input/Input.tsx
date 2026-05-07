import clsx from "clsx";

import type { InputType } from "./InputType";
import type { InputStatus } from "./InputStatus";
import s from "./Input.module.css";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  type: InputType;
  pdLeft?: boolean;
  pdRight?: boolean;
  status?: InputStatus | undefined;
}

const Input = (props: Props) => {
  const {
    type = "text",
    pdLeft = false,
    pdRight = false,
    status = "normal",
    placeholder,
    className,
    children,
    ...rest
  } = props;

  return (
    <div className={clsx(s.inputContainer, s[status!])}>
      <input
        {...rest}
        className={clsx(s.input, className, {
          [s.pdLeft]: pdLeft,
          [s.pdRight]: pdRight
        })}
        type={type}
        placeholder={placeholder}
        autoComplete={type === "email" ? "email" : undefined}
      />
      {children}
    </div>
  );
};

export default Input;
