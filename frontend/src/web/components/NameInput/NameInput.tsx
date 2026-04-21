import clsx from "clsx";

import { Icon, Input } from "components";

import s from "./NameInput.module.css";
import type { InputStatus } from "components/Input/InputStatus";

interface Props {
  placeholder?: string;
  status?: InputStatus;
}

const NameInput = ({ placeholder = "Name", status = "normal" }: Props) => {
  return (
    <Input type="email" pdLeft={true} placeholder={placeholder} status={status}>
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
