// Libraries
import { useEffect, useState } from "react";
// Project level
import { Avatar, LinkButton } from "components";
import { useAuth } from "hooks";
import api from "api";
// Local level
import s from "./Navigation.module.css";
import type { PublicUser } from "pages/ProfilePage/types";

interface Props {
  onLinkClick?: () => void;
}

const Navigation = ({ onLinkClick }: Props) => {
  const { authStatus } = useAuth();
  const isLoggedIn = authStatus === "authenticated";

  const [user, setUser] = useState<PublicUser | null>(null);

  const navLinks = [
    { path: "/lobby", label: "Play" },
    { path: "/rules", label: "Rules" },
    { path: "/about", label: "About" },
  ];

  useEffect(() => {
    if (!isLoggedIn) return;

    let isActive = true;

    const loadUser = async () => {
      try {
        const userData = await api.me.getMe();

        if (isActive) {
          setUser(userData);
        }
      } catch (error) {
        console.error("Cannot retrieve user", error);
      }
    };

    void loadUser();

    return () => {
      isActive = false;
    };
  }, [isLoggedIn]);

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
          <span className={s.username}>{user?.username}</span>
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
