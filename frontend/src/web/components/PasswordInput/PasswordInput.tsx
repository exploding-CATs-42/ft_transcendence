import { useState } from "react";

import { Icon, Input } from "components";
import type { InputType } from "components/Input/InputType";

import s from "./PasswordInput.module.css";

const PasswordInput = () => {
  const [type, setType] = useState<InputType>("password");

  const toggleType = () => {
    if (type == "password") setType("text");
    else setType("password");
  };

  return (
    <Input type={type} pdLeft={true} pdRight={true}>
      <Icon className={s.leftIcon} name="lock" width={24} height={24} />
      <button className={s.button} onClick={toggleType}>
        <Icon
          className={s.rightIcon}
          name={type == "password" ? "eye-off" : "eye"}
          width={22}
          height={22}
        />
      </button>
    </Input>
  );
};

export default PasswordInput;
