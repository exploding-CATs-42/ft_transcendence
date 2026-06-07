// Libraries
import { useLocation } from "react-router-dom";
// Local level
import { LoginForm, RegisterForm } from "./components";
// CSS
import s from "./AuthPage.module.css";

const AuthPage = () => {
  const location = useLocation();

  return (
    <div className={s.backgroundContainer}>
      <div className={s.blur} />
      <div className={s.pageContainer}>
        <h1 className={s.title}>
          Exploding <span className={s.kittensSpan}>kittens</span>
        </h1>
        <div className={s.formBackground}>
          {location.pathname.endsWith("register") ? (
            <RegisterForm />
          ) : (
            <LoginForm />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
