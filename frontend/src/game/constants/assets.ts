export const Textures = {
  background: "background",
} as const;

type Textures = (typeof Textures)[keyof typeof Textures];
