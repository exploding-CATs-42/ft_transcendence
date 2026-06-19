// Libraries
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";
// Project level
import { AuthForm, EmailInput, FormField, PasswordInput } from "components";
import type { LoginSchema } from "@exploding-cats/contracts";
import api from "api";
import type { BadRequestErrorResponse } from "types";
import { useAuth } from "hooks";

const LoginForm = () => {
  const { setAccessToken } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
    setError,
  } = useForm<LoginSchema>();

  const onSubmit: SubmitHandler<LoginSchema> = async (data) => {
    try {
      const { accessToken } = await api.auth.login(data);
      setAccessToken(accessToken);
      toast.success("Success");
    } catch (error) {
      const err = error as AxiosError<
        BadRequestErrorResponse<keyof LoginSchema>
      >;

      if (err.response?.status !== 400) {
        toast.error(err.message);
        return;
      }

      const fieldErrors = err.response.data.errors.fieldErrors;

      Object.entries(fieldErrors).forEach(([field, messages]) => {
        const message = messages[0];

        if (!message) return;

        setError(field as keyof LoginSchema, { message });
      });
    }
  };

  return (
    <AuthForm
      title="Sign in"
      redirectMessage="Don't have an account?"
      redirectTitle="Sign up"
      redirectLink="/register"
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
      <FormField error={errors.password?.message && "Invalid password"}>
        <PasswordInput
          {...register("password")}
          status={errors.password ? "error" : "normal"}
        />
      </FormField>
    </AuthForm>
  );
};

export default LoginForm;
