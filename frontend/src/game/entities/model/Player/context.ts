// Local level
import type { MyContext as MyBaseContext } from "./me";
import type { OpponentContext as OpponentBaseContext } from "./opponent";

export interface MyContext extends MyBaseContext {
  role: "me";
}

export interface OpponentContext extends OpponentBaseContext {
  role: "opponent";
}

export type PlayerContext = MyContext | OpponentContext;
