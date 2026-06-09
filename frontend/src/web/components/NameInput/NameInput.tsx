// Project level
import { Input } from "components";
import type { InputStatus } from "types";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  status?: InputStatus;
}

const NameInput = ({ placeholder = "Name", status, ...rest }: Props) => {
  return (
    <Input
      {...rest}
      type="text"
      iconName="user"
      placeholder={placeholder}
      status={status}
    />
  );
};

export default NameInput;
