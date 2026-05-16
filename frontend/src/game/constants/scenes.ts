export const Scenes = {
  Boot: "Boot",
  Preloader: "Preloader",
  WaitingRoom: "Waiting room",
  Game: "Game",
} as const;

type Scenes = (typeof Scenes)[keyof typeof Scenes];
