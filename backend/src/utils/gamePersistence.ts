import fs from "node:fs/promises";
import path from "path";
import { GameId, GameState } from "../types";

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

export async function loadGames(games: Map<GameId, GameState>): Promise<void> {
  try {
    await ensurePersistenceDir();

    const raw = await fs.readFile(FILE_PATH, "utf8");

    if (!raw.trim()) {
      console.log("Persistence file is empty");
      return;
    }

    const parsedGames: GameState[] = JSON.parse(raw);

    for (const game of parsedGames) {
      games.set(game.gameId, game);
    }

    console.log(`Loaded ${parsedGames.length} games`);
  } catch (error) {
    console.error("Failed to load games", error);
  }
}

export async function saveGames(games: Map<GameId, GameState>): Promise<void> {
  try {
    await ensurePersistenceDir();

    const data = JSON.stringify([...games.values()], null, 2);
    const tempFilePath = `${FILE_PATH}.tmp`;

    await fs.writeFile(tempFilePath, data);
    await fs.rename(tempFilePath, FILE_PATH);
  } catch (error) {
    console.error("Failed to save games", error);
  }
}

export function createSaveLoop(games: Map<GameId, GameState>) {
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
  games: Map<GameId, GameState>,
  stop: () => void,
) {
  console.log("Shutdown detected");

  stop();
  await saveGames(games);

  process.exit(0);
}
