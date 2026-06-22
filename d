diff --git a/frontend/src/game/entities/model/Me/emitters.ts b/frontend/src/game/entities/model/Me/emitters.ts
new file mode 100644
index 00000000..738b98c6
--- /dev/null
+++ b/frontend/src/game/entities/model/Me/emitters.ts
@@ -0,0 +1,14 @@
+// Local level
+import { type MyOutEvent, MyOutEvents } from "./events";
+
+export const exploded = (): MyOutEvent => {
+  return {
+    type: MyOutEvents.EXPLODED,
+  };
+};
+
+/* emitter - is a function that emits an "event" object to the "outside world",
+ * giving it it's type and optional payload.
+ * it takes as a parameter an object, containing machine context,
+ * and an event that triggered the emission
+ */
diff --git a/frontend/src/game/entities/model/Me/events.ts b/frontend/src/game/entities/model/Me/events.ts
new file mode 100644
index 00000000..1a359264
--- /dev/null
+++ b/frontend/src/game/entities/model/Me/events.ts
@@ -0,0 +1,19 @@
+// Events sent TO the machine
+export const MyEvents = {
+  EXPLODE: "EXPLODE",
+} as const;
+
+export type MyEvents =
+  (typeof MyEvents)[keyof typeof MyEvents];
+
+export type MyEvent = { type: typeof MyEvents.EXPLODE };
+
+// Events emitted FROM the machine
+export const MyOutEvents = {
+  EXPLODED: "EXPLODED",
+} as const;
+
+export type MyOutEvents =
+  (typeof MyOutEvents)[keyof typeof MyOutEvents];
+
+export type MyOutEvent = { type: typeof MyOutEvents.EXPLODED };
diff --git a/frontend/src/game/entities/model/Me/myMachine.ts b/frontend/src/game/entities/model/Me/myMachine.ts
new file mode 100644
index 00000000..c2404a2f
--- /dev/null
+++ b/frontend/src/game/entities/model/Me/myMachine.ts
@@ -0,0 +1,35 @@
+// Libraries
+import { emit, setup } from "xstate";
+// Local level
+import { MyStates } from "./states";
+import { type MyEvent, type MyOutEvent, MyEvents } from "./events";
+import { exploded } from "./emitters";
+
+export type MyContext = object;
+
+export const gameMachine = setup({
+  types: {
+    context: {} as MyContext,
+    events: {} as MyEvent,
+    emitted: {} as MyOutEvent,
+  },
+}).createMachine({
+  id: "My",
+  initial: MyStates.ALIVE,
+  context: () => ({
+    cards: [],
+  }),
+  states: {
+    [MyStates.ALIVE]: {
+      on: {
+        [MyEvents.EXPLODE]: {
+          target: MyStates.DEAD,
+        },
+      },
+    },
+    [MyStates.DEAD]: {
+      entry: emit(exploded),
+      type: "final",
+    },
+  },
+});
diff --git a/frontend/src/game/entities/model/Me/states.ts b/frontend/src/game/entities/model/Me/states.ts
new file mode 100644
index 00000000..a788e844
--- /dev/null
+++ b/frontend/src/game/entities/model/Me/states.ts
@@ -0,0 +1,4 @@
+export const MyStates = {
+  ALIVE: "alive",
+  DEAD: "dead",
+} as const;
