// Libraries
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
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

const RegisterForm = () => {
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
      await api.auth.register(data);
      toast.success("Account created");
      navigate("/login");
    } catch (error) {
      toast.error((error as Error).message, { autoClose: 5000 });
    }
  };

  return (
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
  );
};

export default RegisterForm;
