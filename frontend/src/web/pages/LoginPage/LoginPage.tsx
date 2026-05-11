// Libraries
import { useForm, type SubmitHandler } from "react-hook-form";
// Project level
import { AuthForm, EmailInput, FormField, PasswordInput } from "components";
import type { LoginSchema } from "schemas";
// Local level
import s from "./LoginPage.module.css";

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors }
  } = useForm<LoginSchema>();

  const onSubmit: SubmitHandler<LoginSchema> = (data) => {
    console.log(data);
  };

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
            onSubmit={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            <FormField error={errors.email?.message}>
              <EmailInput {...register("email")} />
            </FormField>
            <FormField error={errors.password?.message}>
              <PasswordInput {...register("password")} />
            </FormField>
          </AuthForm>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
