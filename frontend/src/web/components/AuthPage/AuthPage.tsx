import { useEffect, type ReactNode } from "react";

import s from "./AuthPage.module.css";

interface Props {
  children: ReactNode;
}

const AuthPage = ({ children }: Props) => {
  useEffect(() => {
    document.body.classList.add(s.background);

    return () => {
      document.body.classList.remove(s.background);
    };
  }, []);

  return (
    <div className={s.pageContainer}>
      <div className={s.title}>
        <span>
          Exploding <span className={s.kittensSpan}>kittens</span>
        </span>
      </div>
      <div className={s.formBackground}>{children}</div>
    </div>
  );
};

export default AuthPage;
