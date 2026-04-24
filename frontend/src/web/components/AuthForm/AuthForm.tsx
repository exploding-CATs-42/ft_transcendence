import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { Button, Icon } from "components";

import s from "./AuthForm.module.css";

interface Props {
  title: string;
  children: ReactNode;
  redirectMessage: string;
  redirectTitle: string;
  redirectLink: string;
}

const AuthForm = ({
  title,
  children,
  redirectMessage,
  redirectTitle,
  redirectLink
}: Props) => {
  return (
    <>
      <div className={s.formTitleContainer}>
        <span className={s.title}>{title}</span>
        <Icon name="paw" width={50} height={50} fill={"#fcf8ee"} />
      </div>
      <form className={s.form} onSubmit={(event) => event.preventDefault()}>
        <div className={s.inputsContainer}>{children}</div>
        <Button className={s.signIn} type="submit" onClick={() => {}}>
          {title}
        </Button>
      </form>
      <span className={s.signUp}>
        {redirectMessage}{" "}
        <Link className={s.signUpLink} to={redirectLink || "/"}>
          {redirectTitle}
        </Link>
      </span>
    </>
  );
};

export default AuthForm;
