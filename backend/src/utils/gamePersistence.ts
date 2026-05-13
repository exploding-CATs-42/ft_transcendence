import fs from "fs";
import path from "path";
import { GameState } from "../types";

const FILE_PATH = path.resolve("./data/games.json");

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
