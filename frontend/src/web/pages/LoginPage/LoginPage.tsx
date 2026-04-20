import { AuthForm, EmailInput, PasswordInput } from "components";

import s from "./LoginPage.module.css";

const LoginPage = () => {
  return (
    <div className={s.backgroundContainer}>
      <div className={s.blur} />
      <div className={s.pageContainer}>
        <h1 className={s.title}>
          Exploding <span className={s.kittensSpan}>kittens</span>
        </h1>
        <div className={s.formBackground}>
          <AuthForm
            title="Sign in"
            redirectMessage="Don't have an account?"
            redirectTitle="Sign up"
            redirectLink="/register"
          >
            <EmailInput></EmailInput>
            <PasswordInput></PasswordInput>
          </AuthForm>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
