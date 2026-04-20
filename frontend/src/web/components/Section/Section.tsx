import clsx from "clsx";
import s from "./Section.module.css";

interface Props {
  className?: string;
	children?: React.ReactNode;
}

const Section = ({
  className,
	children
}: Props) => {
  return (
    <div className={clsx(s.section, className)}>
			{children}
    </div>
  );
};

export default Section;
