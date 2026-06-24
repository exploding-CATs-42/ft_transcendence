// Local level
import type { MyContext as MyBaseContext } from "./me";
import type { OpponentContext as OpponentBaseContext } from "./opponent";

interface SharedContext {
  turnCount: number;
}

export interface MyContext extends MyBaseContext, SharedContext {
  role: "me";
}

export interface OpponentContext extends OpponentBaseContext, SharedContext {
  role: "opponent";
}

export type PlayerContext = MyContext | OpponentContext;
