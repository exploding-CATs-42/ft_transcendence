// Project level
import { Input } from "components";
import type { InputStatus } from "types";
// Local level
import s from "./SearchInput.module.css";

interface Props {
  placeholder?: string;
  status?: InputStatus;
}

const SearchInput = ({
  placeholder = "Player ID",
  status = "normal",
}: Props) => {
  return (
    <Input
      status={status}
      type="text"
      iconName="user"
      placeholder={placeholder}
      className={s.input}
    />
  );
};

export default SearchInput;
