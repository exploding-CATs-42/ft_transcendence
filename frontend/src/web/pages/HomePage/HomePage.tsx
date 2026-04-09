import { CatImage, LinkButton } from "components";

import s from "./HomePage.module.css";

const HomePage = () => {
  return (
    <div className={s.pageContainer}>
      <div className={s.titleButtonsContainer}>
        <h1 className={s.title}>
          Exploding <span className={s.kittensSpan}>kittens</span>
        </h1>
        <div className={s.buttonsContainer}>
          <LinkButton className={s.playButton} to={"/lobby"}>
            Play
          </LinkButton>
          <LinkButton className={s.watchButton} to={"/rules"}>
            Watch Gameplay
          </LinkButton>
        </div>
      </div>
      <CatImage className={s.catImage} />
    </div>
  );
};

export default HomePage;
