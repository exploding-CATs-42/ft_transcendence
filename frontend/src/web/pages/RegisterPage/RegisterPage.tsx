import { AuthForm, EmailInput, NameInput, PasswordInput } from "components";

import s from "./RegisterPage.module.css";

const RegisterPage = () => {
  return (
    <div className={s.backgroundContainer}>
      <div className={s.blur} />
      <div className={s.pageContainer}>
        <h1 className={s.title}>
          Exploding <span className={s.kittensSpan}>kittens</span>
        </h1>
        <div className={s.formBackground}>
          <AuthForm
            title="Sign up"
            redirectMessage="Already have an account?"
            redirectTitle="Sign in"
            redirectLink="/login"
          >
            <EmailInput></EmailInput>
            <NameInput placeholder="Nickname"></NameInput>
            <PasswordInput></PasswordInput>
            <PasswordInput placeholder="Password confirmation"></PasswordInput>
          </AuthForm>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
