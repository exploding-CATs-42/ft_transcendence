// Libraries
import { Link } from "react-router-dom";
// Local level
import s from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={s.footer}>
      <p className={s.copy}>© 2026 Exploding CATs — a 42 student project</p>

      <nav>
        <ul className={s.linkList}>
          <li>
            <Link to="/privacy" className={s.link}>
              Privacy Policy
            </Link>
          </li>
          <li>
            <Link to="/terms" className={s.link}>
              Terms of Service
            </Link>
          </li>
        </ul>
      </nav>
    </footer>
  );
};

export default Footer;
