// Project level
import type { DevProfile } from "types";
// CSS
import s from "./DevCard.module.css";

const ContactCard = (props: DevProfile) => {
  const { name, photoUrl } = props;

  return (
    <div className={s.card}>
      <img className={s.photo} src={photoUrl} alt={name} width={464} />
      <h3 className={s.name}>{name}</h3>
    </div>
  );
};

export default ContactCard;
