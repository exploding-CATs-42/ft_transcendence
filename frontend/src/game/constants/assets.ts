export const Textures = {
  preloaderBg: "preloaderBg",
  avatar: "avatar",
  waitingRoomBg: "waitingRoomBg",
  gameRoomBg: "gameRoomBg",
  fullScreenToggle: "fullscreenToggle",
  cards: "cards",
  cardCover: "cardCover",
  confirmedIcon: "confirmedIcon",
  playerSpotlight: "playerSpotlight",
} as const;

type Textures = (typeof Textures)[keyof typeof Textures];
