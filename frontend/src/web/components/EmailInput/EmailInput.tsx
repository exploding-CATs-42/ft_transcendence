// Project level
import { Input } from "components";
import type { InputStatus } from "types";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  status?: InputStatus;
}

const EmailInput = ({ placeholder = "Email", status, ...rest }: Props) => {
  return (
    <Input
      {...rest}
      type="email"
      iconName="mail"
      placeholder={placeholder}
      status={status}
    />
  );
};

export default EmailInput;
