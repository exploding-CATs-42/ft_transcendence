import { Icon, Input } from "components";

import s from "./EmailInput.module.css";
import type { InputStatus } from "components/Input/InputStatus";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  status?: InputStatus;
}

const EmailInput = ({ placeholder = "Email", status, ...rest }: Props) => {
  return (
    <Input
      {...rest}
      type="email"
      pdLeft={true}
      placeholder={placeholder}
      status={status}
    >
      <Icon className={s.icon} name="mail" width={24} height={24} />
    </Input>
  );
};

export default EmailInput;
