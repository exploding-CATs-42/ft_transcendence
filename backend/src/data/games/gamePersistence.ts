// Libraries
import { createActor, Snapshot } from "xstate";
import fs from "node:fs/promises";
import path from "path";
// Project level
import { gameMachine, GameInstance, GameInfo, attachBroadcaster } from "game";
// Local level
import { GameId } from "./types";

interface PersistedGame {
  info: GameInfo;
  snapshot: Snapshot<unknown>;
}

const persistencePath = process.env["GAME_PERSISTENCE_FILE_PATH"];

if (!persistencePath) {
  throw new Error("GAME_PERSISTENCE_FILE_PATH is not defined");
}

const FILE_PATH = path.resolve(persistencePath);
const SAVE_INTERVAL_MS = 5000;

export async function ensurePersistenceDir() {
  const dir = path.dirname(FILE_PATH);

  await fs.mkdir(dir, { recursive: true });

  try {
    await fs.access(FILE_PATH);
  } catch {
    await fs.writeFile(FILE_PATH, "[]");
  }
}

export async function loadGames(
  games: Map<GameId, GameInstance>,
): Promise<void> {
  try {
    await ensurePersistenceDir();

    const raw = await fs.readFile(FILE_PATH, "utf8");

    if (!raw.trim()) {
      console.log("Persistence file is empty");
      return;
    }

    const persistedGames: PersistedGame[] = JSON.parse(raw);

    for (const { info, snapshot } of persistedGames) {
      const actor = createActor(gameMachine, { snapshot });
      attachBroadcaster(info.id, actor);
      actor.start();
      games.set(info.id, { info, actor });
    }

    console.log(`Loaded ${persistedGames.length} games`);
  } catch (error) {
    console.error("Failed to load games", error);
  }
}

export async function saveGames(
  games: Map<GameId, GameInstance>,
): Promise<void> {
  try {
    if (!games) {
      throw new Error("saveGames called with undefined games");
    }
    await ensurePersistenceDir();

    const persistedGames: PersistedGame[] = [...games.values()].map((game) => ({
      info: game.info,
      snapshot: game.actor.getPersistedSnapshot(),
    }));

    const data = JSON.stringify(persistedGames, null, 2);
    const tempFilePath = `${FILE_PATH}.tmp`;

    await fs.writeFile(tempFilePath, data);
    await fs.rename(tempFilePath, FILE_PATH);
  } catch (error) {
    console.error("Failed to save games", error);
  }
}

export function createSaveLoop(games: Map<GameId, GameInstance>) {
  let timeout: ReturnType<typeof setTimeout>;
  let stopped = false;

  async function loop() {
    if (stopped) return;

    await saveGames(games);

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

export async function shutdown(
  games: Map<GameId, GameInstance>,
  stop: () => void,
) {
  console.log("Shutdown detected");

  stop();
  await saveGames(games);

  process.exit(0);
}
