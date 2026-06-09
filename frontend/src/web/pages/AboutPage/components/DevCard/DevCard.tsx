// Libraries
import clsx from "clsx";
// Project level
import type { DevProfile } from "types";
// CSS
import s from "./DevCard.module.css";

const ContactCard = (props: DevProfile) => {
  const { name, photoUrl, githubUrl, linkedInUrl, email } = props;

  return (
    <div className={s.card}>
      <img className={s.photo} src={photoUrl} alt={name} width={464} />

      <ul className={s.socialsList}>
        <li>
          <a
            className={clsx(s.socialLink, s.linkedIn)}
            href={linkedInUrl}
            target="_blank"
          >
            LinkedIn
          </a>
        </li>
        <li>
          <a
            className={clsx(s.socialLink, s.gitHub)}
            href={githubUrl}
            target="_blank"
          >
            GitHub
          </a>
        </li>
        <li>
          <a
            className={clsx(s.socialLink, s.email)}
            href={`mailto:${email}`}
            target="_blank"
          >
            Email
          </a>
        </li>
      </ul>
      <h3 className={s.name}>{name}</h3>
    </div>
  );
};

export default ContactCard;
