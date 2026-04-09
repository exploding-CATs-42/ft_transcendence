const Logo = () => {
  return (
    <img
      src="/src/web/assets/images/logo/logo-mobile.png"
      srcSet="
    /src/web/assets/images/logo/logo-mobile.png 51w,
    /src/web/assets/images/logo/logo-laptop.png 70w,
    /src/web/assets/images/logo/logo-desktop.png 80w"
      sizes="
    (max-width: 1439px) 51px,
    (max-width: 1919px) 70px,
    80px"
      alt="Exploding logo hugs Earth"
    />
  );
};

export default Logo;
