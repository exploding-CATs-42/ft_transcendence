// Libraries
import { forwardRef } from "react";
import clsx from "clsx";
// Project Level
import { Icon } from "components";
import type { IconName } from "types";
// Local level
import type { InputType, InputStatus } from "./types";
import s from "./Input.module.css";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  type: InputType;
  iconName?: IconName;
  iconClassName?: string;
  status?: InputStatus | undefined;
}

const Input = forwardRef<HTMLInputElement, Props>((props, ref) => {
  const {
    type = "text",
    iconName,
    iconClassName,
    status = "normal",
    placeholder,
    className,
    children,
    ...rest
  } = props;

  return (
    <div className={clsx(s.inputContainer, s[status!])}>
      <input
        {...rest}
        ref={ref}
        className={clsx(s.input, className, {
          [s.pdLeft]: iconName,
        })}
        type={type}
        placeholder={placeholder}
        autoComplete={type === "email" ? "email" : undefined}
      />
      {iconName && (
        <Icon
          className={iconClassName || s.icon}
          name={iconName}
          width={24}
          height={24}
        />
      )}

      {children}
    </div>
  );
});

export default Input;
