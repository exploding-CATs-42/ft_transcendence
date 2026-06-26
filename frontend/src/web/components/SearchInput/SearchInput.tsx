// Project level
import { Input } from "components";
import type { InputStatus } from "types";
// Local level
import s from "./SearchInput.module.css";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  status?: InputStatus;
}

const SearchInput = ({ placeholder = "Player ID", status, ...rest }: Props) => {
  return (
    <Input
      {...rest}
      className={s.input}
      type="text"
      iconName="user"
      placeholder={placeholder}
      status={status}
    />
  );
};

export default SearchInput;
