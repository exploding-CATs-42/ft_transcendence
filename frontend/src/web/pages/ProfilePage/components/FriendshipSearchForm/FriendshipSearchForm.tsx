// Libraries
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
// Project level
import { type UserIdBody } from "@exploding-cats/contracts";
import { Button, FormField, SearchInput } from "components";
import type { BadRequestErrorResponse } from "types";
import type { AxiosError } from "axios";
// Local level
import s from "./FriendshipSearchForm.module.css";

interface Props {
  onSubmit: (userId: string) => Promise<void>;
}

function FriendshipSearchForm({ onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<UserIdBody>({
    defaultValues: {
      userId: "",
    },
  });

  const submit = async (data: UserIdBody) => {
    try {
      await onSubmit(data.userId);
      toast.success("Success");
    } catch (error) {
      const err = error as AxiosError<BadRequestErrorResponse>;

      const response = err.response?.data;
      const fieldErrors = response?.errors?.fieldErrors;

      if (err.response?.status !== 400 || !fieldErrors) {
        toast.error(response?.message ?? err.message);
        return;
      }

      Object.entries(fieldErrors).forEach(([field, messages]) => {
        const message = messages?.[0];
        if (!message) return;

        setError(field as keyof UserIdBody, { message });
      });
    }
  };

  return (
    <form className={s.footer} onSubmit={handleSubmit(submit)}>
      <FormField error={errors.userId?.message} className={s.error}>
        <SearchInput {...register("userId")} />
      </FormField>

      <Button className={s.button} type="submit">
        Add
      </Button>
    </form>
  );
}

export default FriendshipSearchForm;
