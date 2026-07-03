import { Icons } from "assets";

export type IconName =
  | "alert"
  | "checkmark"
  | "chevron"
  | "cross"
  | "error"
  | "eye"
  | "eye-off"
  | "lock"
  | "log-out"
  | "mail"
  | "paw"
  | "pencil"
  | "plus"
  | "settings"
  | "trash-can"
  | "user"
  | "burger-menu"
  | "puzzle"
  | "download"
  | "copy";

interface Props {
  width?: number;
  height?: number;
  id?: string;
  className?: string | undefined;
  stroke?: string;
  fill?: string;
  name: IconName;
}

const Icon = ({ name, width, height, id, className, stroke, fill }: Props) => {
  return (
    <svg
      className={className}
      id={id}
      width={width}
      height={height}
      stroke={stroke}
      fill={fill}
    >
      <use href={`${Icons}#${name}`} />
    </svg>
  );
};

export default Icon;
