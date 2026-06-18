// Libraries
import clsx from "clsx";
// Project level
import { Avatar as placeholder } from "assets";
// Local level
import s from "./Avatar.module.css";

type Variant = "profile" | "settings" | "badge" | "friend" | "game";

const variantClass: Record<Variant, string> = {
  profile: s.avatarProfile,
  settings: s.avatarSettings,
  badge: s.avatarBadge,
  friend: s.avatarFriend,
  game: s.avatarGame,
};

interface Props {
  className?: string;
  variant?: Variant;
  src?: string | null;
  alt?: string;
}

const Avatar = ({
  className,
  variant = "profile",
  src,
  alt = "Fierce cat mascot logo in red and gold",
}: Props) => {
  const avatarSrc = src ?? placeholder;

  return (
    <img
      className={clsx(s.avatar, variantClass[variant], className)}
      src={avatarSrc}
      alt={alt}
    />
  );
};

export default Avatar;
