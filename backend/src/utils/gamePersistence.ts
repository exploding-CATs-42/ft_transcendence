import fs from "fs";
import path from "path";
import { GameState } from "../types";

const FILE_PATH = path.resolve("./data/games.json");

export function loadGames(games: Map<string, GameState>): void {
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

export function saveGames(games: Map<string, GameState>): void {
  try {
    const data = JSON.stringify([...games.values()], null, 2);

    const tempFilePath = `${FILE_PATH}.tmp`;

    fs.writeFileSync(tempFilePath, data);
    fs.renameSync(tempFilePath, FILE_PATH);
  } catch (error) {
    console.error("Failed to save games", error);
  }
}
