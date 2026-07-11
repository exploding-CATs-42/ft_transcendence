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
  cardTypeIcons: "cardTypeIcons",
  attackIcon: "attackIcon",
  shuffle: "shuffle",
  dead: "dead",
  nope: "nope",
  arrowLeft: "arrowLeft",
  arrowRight: "arrowRight",
} as const;

type Textures = (typeof Textures)[keyof typeof Textures];
