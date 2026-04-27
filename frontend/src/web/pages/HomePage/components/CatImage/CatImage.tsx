interface Props {
  className?: string;
}

const CatImage = ({ className }: Props) => {
  return (
    <img
      className={className}
      src="/src/web/assets/images/cat/cat-mobile.png"
      srcSet="
    /src/web/assets/images/cat/cat-mobile.png 328w,
    /src/web/assets/images/cat/cat-tablet.png 465w,
    /src/web/assets/images/cat/cat-laptop.png 651w,
    /src/web/assets/images/cat/cat-desktop.png 708w"
      sizes="
    (max-width: 767px) 328px,
    (max-width: 1439px) 465px,
    (max-width: 1919px) 651px,
    708px"
      alt="Exploding cat hugs Earth"
    />
  );
};

export default CatImage;
