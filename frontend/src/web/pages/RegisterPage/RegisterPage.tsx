// Libraries
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// Project level
import { AuthForm, EmailInput, NameInput, PasswordInput } from "components";
import { registerSchema, type RegisterSchema } from "schemas";
// Local level
import s from "./RegisterPage.module.css";

const RegisterPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit: SubmitHandler<RegisterSchema> = async (data) => {
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
            title="Sign up"
            redirectMessage="Already have an account?"
            redirectTitle="Sign in"
            redirectLink="/login"
            onSubmit={handleSubmit(onSubmit)}
          >
            <EmailInput
              {...register("email")}
              status={errors.email ? "error" : "normal"}
            />
            <NameInput
              {...register("username")}
              status={errors.username ? "error" : "normal"}
              placeholder="Username"
            />
            <PasswordInput
              {...register("password")}
              status={errors.password ? "error" : "normal"}
            />
            <PasswordInput
              {...register("passwordConfirm")}
              status={errors.passwordConfirm ? "error" : "normal"}
              placeholder="Password confirmation"
            />
          </AuthForm>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
