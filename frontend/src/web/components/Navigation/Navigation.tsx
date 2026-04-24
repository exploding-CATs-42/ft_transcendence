import { Button, LinkButton } from "components";

import s from "./Navigation.module.css";
import { Link } from "react-router-dom";

const Navigation = () => {
  const navLinks = [
    { path: "/lobby", label: "Play" },
    { path: "/rules", label: "Rules" },
    { path: "/about", label: "About" }
  ];

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

      <Link to="/register">
        <Button className={s.signUp}>Sign up</Button>
      </Link>
    </>
  );
};

export default Navigation;
