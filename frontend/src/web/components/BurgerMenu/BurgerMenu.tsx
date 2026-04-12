import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import clsx from "clsx";

import { Navigation, Icon } from "components";

import s from "./BurgerMenu.module.css";

interface Props {
  isOpened: boolean;
  toggleMenu: (menuState: boolean) => void;
}

const BurgerMenu = ({ isOpened, toggleMenu }: Props) => {
  const location = useLocation();

  useEffect(() => {
    if (isOpened) toggleMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpened ? "hidden" : "auto";
  }, [isOpened]);

  return (
    <>
      <button
        className={s.burgerMenuButton}
        onClick={() => {
          toggleMenu(!isOpened);
        }}
      >
        {(isOpened && <Icon name="cross" width={32} height={32} />) || (
          <Icon name="burger-menu" width={48} height={26} />
        )}
      </button>
      <div
        className={clsx(s.burgerMenuContainer, {
          [s.openedBurgerMenu]: isOpened
        })}
      >
        <div className={s.navContainer}>
          <Navigation />
        </div>
      </div>
    </>
  );
};

export default BurgerMenu;
