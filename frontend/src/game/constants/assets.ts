export const Textures = {
  background: "background",
  avatar: "avatar",
} as const;

type Textures = (typeof Textures)[keyof typeof Textures];
