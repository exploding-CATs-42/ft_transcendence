diff --git a/packages/game/src/entities/Game/actions.ts b/packages/game/src/entities/Game/actions.ts
index 61f10dc..dcdeb0c 100644
--- a/packages/game/src/entities/Game/actions.ts
+++ b/packages/game/src/entities/Game/actions.ts
@@ -1,6 +1,8 @@
 import type { GameContext } from "./gameMachine";
 import { type GameEvent, GameEvents } from "./events";
 import { createDeck, dealInitialCards } from "../../utils";
+import { assign } from "xstate";
+import { GameAction, GameActionImplementation } from "./types";
 
 export const GameActions = {
   ADD_PLAYER: "addPlayer",
@@ -16,7 +18,7 @@ export interface GameActionArgs {
   event: GameEvent;
 }
 
-export const addPlayer = ({ context, event }: GameActionArgs) => {
+const addPlayer = ({ context, event }: GameActionArgs) => {
   if (event.type !== GameEvents.JOIN_GAME) return context;
 
   return {
@@ -24,7 +26,7 @@ export const addPlayer = ({ context, event }: GameActionArgs) => {
   };
 };
 
-export const removePlayer = ({ context, event }: GameActionArgs) => {
+const removePlayer = ({ context, event }: GameActionArgs) => {
   if (event.type !== GameEvents.LEAVE_GAME) return context;
 
   return {
@@ -32,7 +34,7 @@ export const removePlayer = ({ context, event }: GameActionArgs) => {
   };
 };
 
-export const addPlayerConfirmation = ({ context, event }: GameActionArgs) => {
+const addPlayerConfirmation = ({ context, event }: GameActionArgs) => {
   if (event.type !== GameEvents.CONFIRM_READINESS) return context;
 
   return {
@@ -42,10 +44,7 @@ export const addPlayerConfirmation = ({ context, event }: GameActionArgs) => {
   };
 };
 
-export const removePlayerConfirmation = ({
-  context,
-  event,
-}: GameActionArgs) => {
+const removePlayerConfirmation = ({ context, event }: GameActionArgs) => {
   if (event.type !== GameEvents.CANCEL_READINESS) return context;
 
   return {
@@ -55,12 +54,12 @@ export const removePlayerConfirmation = ({
   };
 };
 
-export const fillDeck = () => {
+const fillDeck = () => {
   const deck = createDeck();
   return { deck };
 };
 
-export const dealCards = ({ context }: GameActionArgs) => {
+const dealCards = ({ context }: GameActionArgs) => {
   const players = context.players.map((player) => ({
     ...player,
     hand: [...player.hand],
@@ -73,3 +72,12 @@ export const dealCards = ({ context }: GameActionArgs) => {
     players,
   };
 };
+
+export default {
+  [GameActions.ADD_PLAYER]: assign(addPlayer),
+  [GameActions.REMOVE_PLAYER]: assign(removePlayer),
+  [GameActions.ADD_PLAYER_CONFIRMATION]: assign(addPlayerConfirmation),
+  [GameActions.REMOVE_PLAYER_CONFIRMATION]: assign(removePlayerConfirmation),
+  [GameActions.FILL_DECK]: assign(fillDeck),
+  [GameActions.DEAL_CARDS]: assign(dealCards),
+} satisfies Record<GameAction, GameActionImplementation>;
diff --git a/packages/game/src/entities/Game/gameMachine.ts b/packages/game/src/entities/Game/gameMachine.ts
index 0be341f..dee8573 100644
--- a/packages/game/src/entities/Game/gameMachine.ts
+++ b/packages/game/src/entities/Game/gameMachine.ts
@@ -1,16 +1,8 @@
 // Libraries
-import { assign, emit, setup } from "xstate";
+import { emit, setup } from "xstate";
 // Local level
 import { GAME_MACHINE_ID, START_GAME_COUNTDOWN_MS } from "./constants";
-import {
-  GameActions,
-  addPlayer,
-  addPlayerConfirmation,
-  dealCards,
-  fillDeck,
-  removePlayer,
-  removePlayerConfirmation,
-} from "./actions";
+import actions, { GameActions } from "./actions";
 import type { Player, Deck } from "../../types";
 import { type GameEvent, type GameOutEvent, GameEvents } from "./events";
 import { GameGuards, hasEnoughPlayers } from "./guards";
@@ -34,14 +26,7 @@ export const gameMachine = setup({
     events: {} as GameEvent,
     emitted: {} as GameOutEvent,
   },
-  actions: {
-    [GameActions.ADD_PLAYER]: assign(addPlayer),
-    [GameActions.REMOVE_PLAYER]: assign(removePlayer),
-    [GameActions.ADD_PLAYER_CONFIRMATION]: assign(addPlayerConfirmation),
-    [GameActions.REMOVE_PLAYER_CONFIRMATION]: assign(removePlayerConfirmation),
-    [GameActions.FILL_DECK]: assign(fillDeck),
-    [GameActions.DEAL_CARDS]: assign(dealCards),
-  },
+  actions: actions,
   guards: {
     [GameGuards.HAS_ENOUGH_PLAYERS]: hasEnoughPlayers,
   },
diff --git a/packages/game/src/entities/Game/types.ts b/packages/game/src/entities/Game/types.ts
index 665e363..71f3381 100644
--- a/packages/game/src/entities/Game/types.ts
+++ b/packages/game/src/entities/Game/types.ts
@@ -1,7 +1,33 @@
 // Libraries
-import { Actor, type Snapshot } from "xstate";
+import {
+  ActionFunction,
+  Actor,
+  NonReducibleUnknown,
+  type Snapshot,
+} from "xstate";
 // Local level
-import { gameMachine } from "./gameMachine";
+import { GameContext, gameMachine } from "./gameMachine";
+import { GameEvent, GameOutEvent } from "./events";
+import { GameActions } from "./actions";
 
 export type GameInstance = Actor<typeof gameMachine>;
 export type GameSnapshot = Snapshot<unknown>;
+
+// Actions
+export interface GameActionArgs {
+  context: GameContext;
+  event: GameEvent;
+}
+
+export type GameAction = (typeof GameActions)[keyof typeof GameActions];
+export type GameActionImplementation = ActionFunction<
+  GameContext,
+  GameEvent,
+  GameEvent,
+  NonReducibleUnknown,
+  never,
+  never,
+  never,
+  never,
+  GameOutEvent
+>;
