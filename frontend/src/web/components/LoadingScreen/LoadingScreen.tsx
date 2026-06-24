//Libraries
import { useState } from "react";
//Project level
import { Loader } from "assets";
//Local level
import s from "./LoadingScreen.module.css";

const LoadingScreen = () => {
  const [gifError, setGifError] = useState(false);

  return (
    <div className={s.loadingScreen}>
      {!gifError ? (
        <img
          src={Loader}
          alt="Loading..."
          className={s.loaderGif}
          onError={() => setGifError(true)}
        />
      ) : (
        <span className={s.loader}></span>
      )}
      <p className={s.loadingText}>Loading</p>
    </div>
  );
};

export default LoadingScreen;
