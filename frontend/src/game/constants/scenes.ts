export const Scenes = {
  Boot: "Boot",
  Preloader: "Preloader",
  Game: "Game",
} as const;

type Scenes = (typeof Scenes)[keyof typeof Scenes];
