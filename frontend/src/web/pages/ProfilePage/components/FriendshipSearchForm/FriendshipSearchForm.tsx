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
    } catch (error) {
      const err = error as AxiosError<BadRequestErrorResponse>;

      if (err.response?.status !== 400) {
        toast.error(err.message);
        return;
      }
      const fieldErrors = err.response.data.errors.fieldErrors;

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
