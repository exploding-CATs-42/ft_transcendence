// Libraries
import type { ReactNode, SubmitEventHandler } from "react";
import { Link } from "react-router-dom";
// Project level
import { Button, Icon } from "components";
// Local level
import s from "./AuthForm.module.css";

interface Props {
  title: string;
  children: ReactNode;
  redirectMessage: string;
  redirectTitle: string;
  redirectLink: string;
  onSubmit: SubmitEventHandler;
  disabled?: boolean;
  legalNote?: ReactNode;
}

const AuthForm = ({
  title,
  children,
  redirectMessage,
  redirectTitle,
  redirectLink,
  onSubmit,
  disabled,
  legalNote,
}: Props) => {
  return (
    <>
      <div className={s.formTitleContainer}>
        <span className={s.title}>{title}</span>
        <Icon name="paw" width={50} height={50} fill={"#fcf8ee"} />
      </div>
      <form className={s.form} onSubmit={onSubmit}>
        <div className={s.inputsContainer}>{children}</div>
        <Button className={s.signIn} type="submit" disabled={disabled}>
          {title}
        </Button>
        {legalNote && <p className={s.legalNote}>{legalNote}</p>}
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
