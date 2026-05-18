// Libraries
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
// Project level
import {
  AuthForm,
  EmailInput,
  FormField,
  NameInput,
  PasswordInput,
} from "components";
import { registerSchema, type RegisterSchema } from "schemas";
import api from "api";
// Local level
import s from "./RegisterPage.module.css";

const RegisterPage = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit: SubmitHandler<RegisterSchema> = async (data) => {
    try {
      await api.users.register(data);
      toast.success("Success");

      await api.users.login({
        email: data.email,
        password: data.password,
      });
      navigate("/lobby");
    } catch (error) {
      toast.error((error as Error).message, { autoClose: 5000 });
    }
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
            disabled={isSubmitting}
          >
            <FormField error={errors.email?.message}>
              <EmailInput
                {...register("email")}
                status={errors.email ? "error" : "normal"}
                autoFocus
              />
            </FormField>
            <FormField error={errors.username?.message}>
              <NameInput
                {...register("username")}
                status={errors.username ? "error" : "normal"}
                placeholder="Username"
              />
            </FormField>
            <FormField error={errors.password?.message}>
              <PasswordInput
                {...register("password")}
                status={errors.password ? "error" : "normal"}
              />
            </FormField>
            <FormField error={errors.passwordConfirm?.message}>
              <PasswordInput
                {...register("passwordConfirm")}
                status={errors.passwordConfirm ? "error" : "normal"}
                placeholder="Password confirmation"
              />
            </FormField>
          </AuthForm>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
