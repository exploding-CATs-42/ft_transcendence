import s from "./FormField.module.css";

interface Props {
  children: React.ReactNode;
  error?: string | undefined;
}

const FormField = ({ children, error }: Props) => {
  return (
    <label className={s.container}>
      {children}
      {error && <span className={s.errorMessage}>{error}</span>}
    </label>
  );
};

export default FormField;
