import clsx from "clsx";

import { Icon, Input } from "components";

import s from "./EmailInput.module.css";
import type { InputStatus } from "components/Input/InputStatus";

interface Props {
  placeholder?: string;
  status?: InputStatus;
}

const EmailInput = ({ placeholder = "Email", status = "normal" }: Props) => {
  return (
    <Input type="email" pdLeft={true} placeholder={placeholder} status={status}>
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
