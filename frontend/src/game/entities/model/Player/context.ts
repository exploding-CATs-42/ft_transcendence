// Local level
import type { MyContext as MyBaseContext } from "./me";
import type { OpponentContext as OpponentBaseContext } from "./opponent";

interface SharedContext {
  turnCount: number;
}

export interface MyContext extends SharedContext, MyBaseContext {
  role: "me";
}

export interface OpponentContext extends SharedContext, OpponentBaseContext {
  role: "opponent";
}

export type PlayerContext = MyContext | OpponentContext;

/* Uncomment the code below and hover over any of the "Expanded" types
 * to see how the final context looks like
 */

// type Prettify<T> = {
//   [K in keyof T]: T[K];
// } & {};

// type ExpandedMyContext = Prettify<MyContext>;
// type ExpandedOpponentContext = Prettify<OpponentContext>;
