import s from "./Logo.module.css";

const Logo = () => {
  return (
    <picture>
      <source
        media="(max-width: 767px)"
        srcSet="/src/web/assets/images/logo/logo-mobile.png"
      />
      <source
        media="(max-width: 1439px)"
        srcSet="/src/web/assets/images/logo/logo-tablet.png"
      />
      <source
        media="(max-width: 1919px)"
        srcSet="/src/web/assets/images/logo/logo-laptop.png"
      />
      <img
        className={s.logo}
        src="/src/web/assets/images/logo/logo-desktop.png"
        alt="C.A.T. logo"
      />
    </picture>
  );
};

export default Logo;
