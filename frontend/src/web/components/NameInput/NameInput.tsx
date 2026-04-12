import clsx from "clsx";

import { Icon, Input } from "components";

import s from "./NameInput.module.css";

const NameInput = () => {
  return (
    <Input type="email" pdLeft={true}>
      <Icon
        className={clsx(s.icon, s.leftIcon)}
        name="user"
        width={24}
        height={24}
      />
    </Input>
  );
};

export default NameInput;
