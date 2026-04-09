import { Link } from "react-router-dom";
import { Logo } from "components";
import { Navigation, BurgerMenu } from "components";

import s from "./Header.module.css";
import { useEffect, useState } from "react";

const Header = () => {
  const [isBurgerMenuOpened, setIsBurgerMenuOpened] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <header className={s.header}>
      <Link to={"/"}>
        <Logo />
      </Link>

      {(screenWidth < 768 && (
        <BurgerMenu
          isOpened={isBurgerMenuOpened}
          toggleMenu={(menuState) => setIsBurgerMenuOpened(menuState)}
        />
      )) || <Navigation />}
    </header>
  );
};

export default Header;
