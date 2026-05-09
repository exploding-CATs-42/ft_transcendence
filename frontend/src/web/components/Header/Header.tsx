// Libraries
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
// Project level
import { Logo, Navigation, BurgerMenu } from "components";
// Local level
import s from "./Header.module.css";

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
      <Link
        to={"/"}
        onClick={() => {
          setIsBurgerMenuOpened(false);
        }}
      >
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
