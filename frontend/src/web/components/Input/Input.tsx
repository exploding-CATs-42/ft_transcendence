import clsx from "clsx";

import type { InputType } from "./InputType";
import type { InputStatus } from "./InputStatus";
import s from "./Input.module.css";

interface Props {
  type: InputType;
  pdLeft?: boolean;
  pdRight?: boolean;
  status?: InputStatus;
  placeholder?: string;
  className?: string;
  children?: React.ReactNode;
}

const defaultState: Props = {
  type: "text",
  pdLeft: false,
  pdRight: false,
  status: "normal"
};

const Input = (props: Props) => {
  const { type, pdLeft, pdRight, status, placeholder, className, children } = {
    ...defaultState,
    ...props
  };

  return (
    <div className={clsx(s.inputContainer, s[status!])}>
      <input
        className={clsx(s.input, className, {
          [s.pdLeft]: pdLeft,
          [s.pdRight]: pdRight
        })}
        type={type}
        placeholder={placeholder}
        autoComplete={(type === "email" && "email") || undefined}
      />
      {children}
    </div>
  );
};

export default Input;
