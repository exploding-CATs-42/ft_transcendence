// Libraries
import { useEffect } from "react";
// CSS
import s from "./RulesPage.module.css";

const RulesPage = () => {
  const tutorialVideoLink =
    "https://www.youtube.com/embed/rcVpTb-iPoQ?playsinline=1&amp;autoplay=1&amp;rel=0&amp;";

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
      <iframe
        src={tutorialVideoLink}
        allowFullScreen={true}
        width={960}
        height={540}
      />
    </div>
  );
};

export default RulesPage;
