import clsx from "clsx";

import { Icon, Input } from "components";

import s from "./EmailInput.module.css";

const EmailInput = () => {
  return (
    <Input type="email" pdLeft={true}>
      <Icon
        className={clsx(s.icon, s.leftIcon)}
        name="mail"
        width={24}
        height={24}
      />
    </Input>
  );
};

export default EmailInput;
