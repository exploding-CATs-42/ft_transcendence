import { Link } from "react-router-dom";
import s from "./NotFoundPage.module.css";

const NotFoundPage = () => {
  return (
    <div className={s.container}>
      <h1>404</h1>
      <h2>Not found</h2>
      <Link className={s.linkButton} to="/" aria-label="Navigate to Home page">
        Home page
      </Link>
    </div>
  );
};

export default NotFoundPage;
