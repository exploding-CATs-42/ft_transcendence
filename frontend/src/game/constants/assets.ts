export const Textures = {
  background: "background",
  avatar: "avatar",
  waitingRoomBg: "waitingRoomBg",
  gameRoomBg: "gameRoomBg",
} as const;

type Textures = (typeof Textures)[keyof typeof Textures];
