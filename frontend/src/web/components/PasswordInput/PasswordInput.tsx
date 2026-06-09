// Libraries
import { useState } from "react";
// Project level
import { Icon, Input } from "components";
import type { InputType, InputStatus } from "types";
// Local level
import s from "./PasswordInput.module.css";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  status?: InputStatus;
}

const PasswordInput = ({
  placeholder = "Password",
  status,
  ...rest
}: Props) => {
  const [type, setType] = useState<InputType>("password");

  const toggleType = () => {
    setType((t) => (t === "password" ? "text" : "password"));
  };

  return (
    <Input
      {...rest}
      className={s.input}
      type={type}
      iconName="lock"
      placeholder={placeholder}
      status={status}
    >
      <button className={s.button} type="button" onClick={toggleType}>
        <Icon
          className={s.rightIcon}
          name={type == "password" ? "eye-off" : "eye"}
          width={24}
          height={24}
        />
      </button>
    </Input>
  );
};

export default PasswordInput;
