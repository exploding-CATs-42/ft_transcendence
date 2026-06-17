// Libraries
import { createActor } from "xstate";
import fs from "node:fs/promises";
import path from "path";
// Project level
import { gameMachine } from "game";
import { attachGameBroadcaster } from "sockets";
// Local level
import { PersistedGame } from "./types";
import { toPersistedGame } from "./mappers";
import GameStore from "./gameStore";

const persistencePath = process.env["GAME_PERSISTENCE_FILE_PATH"];

if (!persistencePath) {
  throw new Error("GAME_PERSISTENCE_FILE_PATH is not defined");
}

const FILE_PATH = path.resolve(persistencePath);
const SAVE_INTERVAL_MS = 5000;

let initialized = false;

export function initGamePersistence() {
  if (initialized) return;

  loadGames();
  const saver = createSaveLoop();
  setupSignalHandlers(() => {
    shutdown(saver.stop);
  });

  initialized = true;
}

export function assertInitialized() {
  if (!initialized) {
    throw new Error(
      "Game store not initialized. Call initGamePersistence() first.",
    );
  }
}

export async function ensurePersistenceDir() {
  const dir = path.dirname(FILE_PATH);

  await fs.mkdir(dir, { recursive: true });

  try {
    await fs.access(FILE_PATH);
  } catch {
    await fs.writeFile(FILE_PATH, "[]");
  }
}

export async function loadGames(): Promise<void> {
  try {
    await ensurePersistenceDir();

    const raw = await fs.readFile(FILE_PATH, "utf8");

    if (!raw.trim()) {
      console.log("Persistence file is empty");
      return;
    }

    const persistedGames: PersistedGame[] = JSON.parse(raw);

    for (const { metadata, snapshot } of persistedGames) {
      const actor = createActor(gameMachine, { snapshot });
      attachGameBroadcaster({ instance: actor, ...metadata });
      actor.start();
      GameStore.addGame({ instance: actor, ...metadata });
    }

    console.log(`Loaded ${persistedGames.length} games`);
  } catch (error) {
    console.error("Failed to load games", error);
  }
}

export async function saveGames(): Promise<void> {
  const games = GameStore.getAllGames();

  try {
    await ensurePersistenceDir();

    const persistedGames = games.map((game) => toPersistedGame(game));

    const data = JSON.stringify(persistedGames, null, 2);
    const tempFilePath = `${FILE_PATH}.tmp`;

    await fs.writeFile(tempFilePath, data);
    await fs.rename(tempFilePath, FILE_PATH);
  } catch (error) {
    console.error("Failed to save games", error);
  }
}

export function createSaveLoop() {
  let timeout: ReturnType<typeof setTimeout>;
  let stopped = false;

  async function loop() {
    if (stopped) return;

    await saveGames();

    if (stopped) return;

    timeout = setTimeout(loop, SAVE_INTERVAL_MS);
  }

  loop();
  return {
    stop(): void {
      clearTimeout(timeout);
      stopped = true;
    },
  };
}

export function setupSignalHandlers(handler: () => void): void {
  process.on("SIGINT", handler);
  process.on("SIGTERM", handler);
}

export async function shutdown(stop: () => void) {
  console.log("Shutdown detected");

  stop();
  await saveGames();

  process.exit(0);
}
