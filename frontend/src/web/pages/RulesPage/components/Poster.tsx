interface Props {
  className: string;
}

const Poster = ({ className }: Props) => {
  return (
    <img
      className={className}
      loading="lazy"
      sizes="(max-width: 740px) calc(100vw - 24px * 2), var(--container-max-width)"
      width="2260"
      height="1271"
      src="//www.explodingkittens.com/cdn/shop/files/video-thumbnail_2260x.jpg?v=1667417823"
      srcSet="//www.explodingkittens.com/cdn/shop/files/video-thumbnail_400x.jpg?v=1667417823 400w, //www.explodingkittens.com/cdn/shop/files/video-thumbnail_500x.jpg?v=1667417823 500w, //www.explodingkittens.com/cdn/shop/files/video-thumbnail_600x.jpg?v=1667417823 600w, //www.explodingkittens.com/cdn/shop/files/video-thumbnail_700x.jpg?v=1667417823 700w, //www.explodingkittens.com/cdn/shop/files/video-thumbnail_800x.jpg?v=1667417823 800w, //www.explodingkittens.com/cdn/shop/files/video-thumbnail_900x.jpg?v=1667417823 900w, //www.explodingkittens.com/cdn/shop/files/video-thumbnail_1000x.jpg?v=1667417823 1000w, //www.explodingkittens.com/cdn/shop/files/video-thumbnail_1200x.jpg?v=1667417823 1200w, //www.explodingkittens.com/cdn/shop/files/video-thumbnail_1400x.jpg?v=1667417823 1400w, //www.explodingkittens.com/cdn/shop/files/video-thumbnail_1600x.jpg?v=1667417823 1600w, //www.explodingkittens.com/cdn/shop/files/video-thumbnail_1800x.jpg?v=1667417823 1800w, //www.explodingkittens.com/cdn/shop/files/video-thumbnail_2000x.jpg?v=1667417823 2000w, //www.explodingkittens.com/cdn/shop/files/video-thumbnail_2200x.jpg?v=1667417823 2200w, //www.explodingkittens.com/cdn/shop/files/video-thumbnail_2260x.jpg?v=1667417823 2260w"
    />
  );
};

export default Poster;
