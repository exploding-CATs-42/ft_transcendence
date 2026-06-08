import { ColorfullIcons as Icons } from "assets";

interface Props {
  width?: number;
  height?: number;
  id?: string;
  className?: string;
  stroke?: string;
  fill?: string;
  name: "percent" | "medal" | "bomb" | "gamepad" | "play";
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
