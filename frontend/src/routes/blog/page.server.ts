import { posts } from "./data";

export function load() {
  return {
    summaries: posts.map((post) => {
      return {
        slug: post.slug,
        title: post.title
      };
    })
  };
}
