// Project level
// Project level
import { Avatar, LinkButton } from "components";
import { useAuth } from "hooks";
// Local level
import s from "./Navigation.module.css";

interface Props {
  onLinkClick?: () => void;
}

const Navigation = ({ onLinkClick }: Props) => {
  const { authStatus } = useAuth();
  const isLoggedIn = authStatus === "authenticated";

  const navLinks = [
    { path: "/lobby", label: "Play" },
    { path: "/rules", label: "Rules" },
    { path: "/about", label: "About" },
  ];

  return (
    <>
      <nav>
        <ul className={s.navList}>
          {navLinks.map((link) => (
            <li key={link.path} className={s.navLinkItem}>
              <LinkButton
                to={link.path}
                className={s.link}
                onClick={() => onLinkClick?.()}
              >
                {link.label}
              </LinkButton>
            </li>
          ))}
        </ul>
      </nav>

      {isLoggedIn ? (
        <LinkButton
          to="/profile"
          className={s.profile}
          onClick={() => onLinkClick?.()}
        >
          <span className={s.username}>BadCat</span>
          <Avatar variant="badge" />
        </LinkButton>
      ) : (
        <LinkButton
          to="/register"
          className={s.signUp}
          onClick={() => onLinkClick?.()}
        >
          Sign up
        </LinkButton>
      )}
    </>
  );
};

export default Navigation;
