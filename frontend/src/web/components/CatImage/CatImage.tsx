interface Props {
  className?: string;
}

const CatImage = ({ className }: Props) => {
  return (
    <picture>
      <source
        media="(max-width: 767px)"
        srcSet="/src/web/assets/images/cat/cat-mobile.png"
      />
      <source
        media="(max-width: 1439px)"
        srcSet="/src/web/assets/images/cat/cat-tablet.png"
      />
      <source
        media="(max-width: 1919px)"
        srcSet="/src/web/assets/images/cat/cat-laptop.png"
      />
      <img
        className={className}
        src="/src/web/assets/images/cat/cat-desktop.png"
        alt="Exploding cat hugs Earth"
      />
    </picture>
  );
};

export default CatImage;
