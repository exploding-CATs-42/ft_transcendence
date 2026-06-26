// Project level
import { Input } from "components";
import type { InputStatus } from "types";
// Local level
import s from "./SearchInput.module.css";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  status?: InputStatus;
}

const SearchInput = ({
  placeholder = "Player ID",
  status = "normal",
  value = "",
  onChange = () => {},
}: Props) => {
  return (
    <Input
      status={status}
      type="text"
      iconName="user"
      placeholder={placeholder}
      className={s.input}
      value={value}
      onChange={onChange}
    />
  );
};

export default SearchInput;
