export const Textures = {
  background: "background",
  avatar: "avatar",
  waitingRoomBg: "waitingRoomBg",
} as const;

type Textures = (typeof Textures)[keyof typeof Textures];
