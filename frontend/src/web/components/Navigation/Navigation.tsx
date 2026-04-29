import { Avatar, Button, LinkButton } from "components";

import s from "./Navigation.module.css";

const Navigation = () => {
  const navLinks = [
    { path: "/lobby", label: "Play" },
    { path: "/rules", label: "Rules" },
    { path: "/about", label: "About" }
  ];

  const isLoggedIn = false;

  return (
    <>
      <nav>
        <ul className={s.navList}>
          {navLinks.map((link) => (
            <li key={link.path} className={s.navLinkItem}>
              <LinkButton to={link.path} className={s.link}>
                {link.label}
              </LinkButton>
            </li>
          ))}
        </ul>
      </nav>

      {isLoggedIn ? (
        <LinkButton to="/profile" className={s.profile}>
          <span className={s.username}>BadCat</span>
          <Avatar variant="badge" />
        </LinkButton>
      ) : (
        <Button className={s.signUp}>Sign up</Button>
      )}
    </>
  );
};

export default Navigation;
