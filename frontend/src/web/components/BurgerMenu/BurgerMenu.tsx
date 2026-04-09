import { useEffect } from "react";
import clsx from "clsx";

import { BurgerMenuIcon, CrossIcon } from "assets";
import { Navigation } from "components";

import s from "./BurgerMenu.module.css";

interface Props {
  isOpened: boolean;
  toggleMenu: (menuState: boolean) => void;
}

const BurgerMenu = ({ isOpened, toggleMenu }: Props) => {
  useEffect(() => {
    if (isOpened) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpened]);

  return (
    <>
      <button
        className={s.burgerMenuButton}
        onClick={() => {
          toggleMenu(!isOpened);
        }}
      >
        {(isOpened && <CrossIcon width={32} height={32} />) || (
          <BurgerMenuIcon width={48} height={26} />
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
