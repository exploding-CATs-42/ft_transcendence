import clsx from "clsx";

import type { InputType } from "./InputType";
import type { InputStatus } from "./InputStatus";
import s from "./Input.module.css";

interface Props {
  type: InputType;
  pdLeft?: boolean;
  pdRight?: boolean;
  status?: InputStatus;
  children?: React.ReactNode;
}

const defaultState: Props = {
  type: "text",
  pdLeft: false,
  pdRight: false,
  status: "success"
};

const Input = (props: Props) => {
  const { type, pdLeft, pdRight, status, children } = {
    ...defaultState,
    ...props
  };

  return (
    <div className={clsx(s.inputContainer, s[status!])}>
      <input
        className={clsx(s.input, {
          [s.pdLeft]: pdLeft,
          [s.pdRight]: pdRight
        })}
        type={type}
        autoComplete={(type === "email" && "email") || undefined}
      />
      {children}
    </div>
  );
};

export default Input;
