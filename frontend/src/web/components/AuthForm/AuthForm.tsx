import { Button, Icon, LinkButton } from "components";

import s from "./AuthForm.module.css";
import type { ReactNode } from "react";

interface Props {
  title?: string;
  children?: ReactNode;
  redirectMessage?: string;
  redirectTitle?: string;
  redirectLink?: string;
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
        <span>{title}</span>
        <Icon name="paw" width={50} height={50} fill={"#fcf8ee"}></Icon>
      </div>
      <form className={s.formInputContainer}>{children}</form>
      <Button className={s.signIn} onClick={() => {}}>
        {title}
      </Button>
      <span className={s.signUp}>
        {redirectMessage}{" "}
        <LinkButton className={s.signUpLink} to={redirectLink || "/"}>
          {redirectTitle}
        </LinkButton>
      </span>
    </>
  );
};

export default AuthForm;
