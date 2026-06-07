import { useState } from "react";
import s from "./LoadingScreen.module.css";
import { Loader } from "assets";

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
      <div className={s.loadingText}>Loading</div>
    </div>
  );
};

export default LoadingScreen;
