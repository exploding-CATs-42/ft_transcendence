import { useEffect } from "react";

import { LinkButton } from "components";
import { CatomicBomb } from "assets";

import s from "./NotFoundPage.module.css";

const NotFoundPage = () => {
  useEffect(() => {
    document.body.classList.add(s.background);

    return () => {
      document.body.classList.remove(s.background);
    };
  }, []);

  return (
    <div className={s.container}>
      <h1 className="visually-hidden">Not Found</h1>
      <div className={s.notFoundContainer}>
        <span className={s.leftFour}>4</span>
        <img className={s.catomicBomb} src={CatomicBomb} alt="Catomic bomb" />
        <span className={s.rightFour}>4</span>
      </div>
      <p className={s.jokingMessage}>
        Sorry. This page has exploded. We checked everywhere, but all we found
        was a confused potato and some suspicious crumbs. You're probably in the
        wrong place. Try going somewhere less… explody.
      </p>
      <LinkButton className={s.linkButton} to="/">
        Home page
      </LinkButton>
    </div>
  );
};

export default NotFoundPage;
