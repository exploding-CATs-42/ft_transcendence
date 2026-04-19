import clsx from "clsx";
import s from "./Avatar.module.css";

type Variant = "profile" | "settings" | "badge" | "friend" | "match";

const variantClass: Record<Variant, string> = {
  profile: s.avatarProfile,
  settings: s.avatarSettings,
  badge: s.avatarBadge,
  friend: s.avatarFriend,
  match: s.avatarMatch,
};

interface Props {
  className?: string;
  variant?: Variant;
  src?: string;
  alt?: string;
}

const Avatar = ({
  className,
  variant = "profile",
  src = "/src/web/assets/images/avatar/avatar-193w.png",
  alt = "Fierce cat mascot logo in red and gold"
}: Props) => {
  return (
    <img
      className={clsx(s.avatar, variantClass[variant], className)}
      srcSet="
        /src/web/assets/images/avatar/avatar-116w.png 116w,
        /src/web/assets/images/avatar/avatar-193w.png 193w
      "
      sizes="
      (min-width: 1920px) 193px,
      (min-width: 1440px) 137px,
      (min-width: 375px) 116px,
      45px
    "
      src={src}
      alt={alt}
    />
  );
};

export default Avatar;
