import { useState } from "react";

import { Icon, Input } from "components";

import type { InputType } from "components/Input/InputType";
import type { InputStatus } from "components/Input/InputStatus";

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
    if (type == "password") setType("text");
    else setType("password");
  };

  return (
    <Input
      {...rest}
      type={type}
      pdLeft={true}
      pdRight={true}
      placeholder={placeholder}
      status={status}
    >
      <Icon className={s.leftIcon} name="lock" width={24} height={24} />
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
