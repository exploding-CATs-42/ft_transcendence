// Project level
import { PhaserGame } from "components";
// Local level
import s from "./GamePage.module.css";

const GamePage = () => {
  return (
    <div id="app" className={s.app}>
      <PhaserGame />
    </div>
  );
};

export default GamePage;
