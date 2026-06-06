// Libraries
import { useEffect, useState } from "react";
// Project level
import { Icon } from "components";
import { PlayIcon } from "assets";
// Local level
import { Poster } from "./components";
// CSS
import s from "./RulesPage.module.css";

const RulesPage = () => {
  const tutorialVideoLink =
    "https://www.youtube.com/embed/rcVpTb-iPoQ?playsinline=1&amp;autoplay=1&amp;rel=0&amp;";

  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const root = document.querySelector("#root") as HTMLElement;
    const main = document.querySelector("main") as HTMLElement;

    if (!root || !main) return;

    const prev = {
      htmlHeight: html.style.height,
      bodyHeight: body.style.height,
      rootHeight: root.style.height,
      mainHeight: main.style.height,
      mainOverflow: main.style.overflow,
    };

    html.style.height = "100%";
    body.style.height = "100%";
    root.style.height = "100%";
    main.style.height = "100%";
    main.style.overflow = "hidden";

    return () => {
      html.style.height = prev.htmlHeight;
      body.style.height = prev.bodyHeight;
      root.style.height = prev.rootHeight;
      main.style.height = prev.mainHeight;
      main.style.overflow = prev.mainOverflow;
    };
  }, []);

  return (
    <div className={s.pageContainer}>
      <p className={s.topText}>You can watch it</p>
      <div className={s.videoWrapper}>
        {isPlaying ? (
          <iframe
            className={s.video}
            src={tutorialVideoLink}
            allowFullScreen={true}
            allow="autoplay"
          />
        ) : (
          <div className={s.posterContainer}>
            <Poster className={s.poster} />
            <button
              className={s.playButton}
              type="button"
              title="Play video"
              onClick={() => setIsPlaying(true)}
            >
              <PlayIcon width={64} height={64} />
            </button>
          </div>
        )}
      </div>
      <div className={s.pdfDownloadContainer}>
        <p className={s.bottomText}>or download full rulebook as a PDF</p>
        <a className={s.downloadLink} href="rules.pdf" target="_blank">
          Download
          <Icon name="download" width={20} height={20} />
        </a>
      </div>
    </div>
  );
};

export default RulesPage;
