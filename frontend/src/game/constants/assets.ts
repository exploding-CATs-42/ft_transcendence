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
  targetIcon: "targetIcon",
  attack: "attack",
} as const;

type Textures = (typeof Textures)[keyof typeof Textures];
