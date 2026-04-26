import { Icon, Input } from "components";
import type { InputStatus } from "components/Input/InputStatus";
import s from "./SearchInput.module.css";

interface Props {
  placeholder?: string;
  status?: InputStatus;
}

const SearchInput = ({
  placeholder = "Player ID",
  status = "normal"
}: Props) => {
  return (
    <Input
      status={status}
      type="text"
      pdLeft={true}
      placeholder={placeholder}
      className={s.input}
    >
      <Icon
        className={s.icon}
        name="user"
        width={24}
        height={24}
      />
    </Input>
  );
};

export default SearchInput;
