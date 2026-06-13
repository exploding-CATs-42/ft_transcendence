import s from "./AvatarWithAdd.module.css";
import Avatar from "components/Avatar/Avatar";

type Props = {
  src: string | null;
  onClick: () => void;
};

export function AvatarWithAdd({ src, onClick }: Props) {
  return (
    <div className={s.wrapper}>
      <Avatar className={s.avatar} variant="profile" src={src} />

      <button
        type="button"
        className={s.plusButton}
        onClick={onClick}
        aria-label="Change avatar"
      >
        +
      </button>
    </div>
  );
}

export default AvatarWithAdd;
