import fs from "fs";
import path from "path";
import { GameId, GameState } from "../types";

const FILE_PATH = path.resolve("./data/games.json");
const SAVE_INTERVAL_MS = 5000;

let autoSaveInterval: NodeJS.Timeout | null = null;

export function loadGames(games: Map<GameId, GameState>): void {
  try {
    if (!fs.existsSync(FILE_PATH)) {
      console.log("No persistence file found");
      return;
    }

    const raw = fs.readFileSync(FILE_PATH, "utf8");

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

export function saveGames(games: Map<GameId, GameState>): void {
  try {
    const data = JSON.stringify([...games.values()], null, 2);

    const tempFilePath = `${FILE_PATH}.tmp`;

    fs.writeFileSync(tempFilePath, data);
    fs.renameSync(tempFilePath, FILE_PATH);
  } catch (error) {
    console.error("Failed to save games", error);
  }
}

export function startAutoSave(games: Map<GameId, GameState>): void {
  if (autoSaveInterval) {
    return;
  }

  autoSaveInterval = setInterval(() => {
    saveGames(games);
  }, SAVE_INTERVAL_MS);

  console.log(`Auto-save started (${SAVE_INTERVAL_MS}ms)`);
}

export function stopAutoSave(): void {
  if (!autoSaveInterval) {
    return;
  }

  clearInterval(autoSaveInterval);
  autoSaveInterval = null;

  console.log("Auto-save stopped");
}

export function setupSignalHandlers(handler: () => void): void {
  process.on("SIGINT", handler);
  process.on("SIGTERM", handler);
}

export function shutdown(games: Map<GameId, GameState>) {
  console.log("Shutdown detected");

  saveGames(games);
  stopAutoSave();

  process.exit(0);
}
