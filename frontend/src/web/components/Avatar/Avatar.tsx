// Libraries
import clsx from "clsx";
// Project level
import { Avatar as placeholder } from "assets";
// Local level
import s from "./Avatar.module.css";

type Variant = "profile" | "badge" | "friend" | "game";

const variantClass: Record<Variant, string> = {
  profile: s.avatarProfile,
  badge: s.avatarBadge,
  friend: s.avatarFriend,
  game: s.avatarGame,
};

interface Props {
  className?: string;
  variant?: Variant;
  src?: string | null;
  alt?: string;
  showStatus?: boolean;
  status?: boolean;
}

const Avatar = ({
  className,
  variant = "profile",
  src,
  alt = "Fierce cat mascot logo in red and gold",
  showStatus = true,
  status = false,
}: Props) => {
  const avatarSrc = src ?? placeholder;

  return (
    <div className={clsx(s.container, className)}>
      <img
        className={clsx(
          s.avatar,
          variantClass[variant],
          !showStatus && s.borderless,
        )}
        src={avatarSrc}
        alt={alt}
      />
      {showStatus && (
        <div className={clsx(s.onlineStatus, status && s.online)} />
      )}
    </div>
  );
};

export default Avatar;
