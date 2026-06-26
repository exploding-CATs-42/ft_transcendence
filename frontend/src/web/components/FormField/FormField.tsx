import s from "./FormField.module.css";

interface Props {
  children: React.ReactNode;
  error?: string | undefined;
  className?: string;
}

const FormField = ({ children, error, className = s.errorMessage }: Props) => {
  return (
    <label className={s.container}>
      {children}
      {error && <span className={className}>{error}</span>}
    </label>
  );
};

export default FormField;
