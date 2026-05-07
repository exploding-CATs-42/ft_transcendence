import { Icon, Input } from "components";

import s from "./NameInput.module.css";
import type { InputStatus } from "components/Input/InputStatus";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  status?: InputStatus;
}

const NameInput = ({ placeholder = "Name", status, ...rest }: Props) => {
  return (
    <Input
      {...rest}
      type="text"
      pdLeft={true}
      placeholder={placeholder}
      status={status}
    >
      <Icon className={s.icon} name="user" width={24} height={24} />
    </Input>
  );
};

export default NameInput;
