// Libraries
import { useForm } from "react-hook-form";
// Project level
import { AuthForm, EmailInput, PasswordInput } from "components";
import type { LoginSchema } from "schemas";
// Local level
import s from "./LoginPage.module.css";

const LoginPage = () => {
  const { register } = useForm<LoginSchema>();

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
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <EmailInput {...register("email")} />
            <PasswordInput {...register("password")} />
          </AuthForm>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
