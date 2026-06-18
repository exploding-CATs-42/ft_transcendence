// Project level
import { Input } from "components";
import type { InputStatus } from "types";
// Local level
import s from "./SearchInput.module.css";

interface Props {
  placeholder?: string;
  status?: InputStatus;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
