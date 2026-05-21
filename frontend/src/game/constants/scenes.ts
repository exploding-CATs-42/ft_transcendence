export const Scenes = {
  Boot: "Boot",
  Preloader: "Preloader",
  WaitingRoom: "Waiting room",
  GameRoom: "Game room",
} as const;

type Scenes = (typeof Scenes)[keyof typeof Scenes];
