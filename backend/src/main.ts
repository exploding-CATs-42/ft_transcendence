import "dotenv/config";
import { setTimeout as delay } from "node:timers/promises";

import { ensureDatabaseConnection } from "./utils";
import app from "./app";

const { PORT = 3000 } = process.env;
const DATABASE_RETRY_DELAY_MS = 2000;

function getDatabaseErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  return message.split("Message: `")[1]?.replace("`", "") ?? message;
}

async function waitForDatabaseConnection(): Promise<void> {
  for (;;) {
    try {
      await ensureDatabaseConnection();
      console.log("Database connection established");

      return;
    } catch (error) {
      console.error(
        `Database connection failed. Retrying in ${DATABASE_RETRY_DELAY_MS} ms:`,
        getDatabaseErrorMessage(error),
      );

      await delay(DATABASE_RETRY_DELAY_MS);
    }
  }
}

async function startServer(): Promise<void> {
  await waitForDatabaseConnection();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

void startServer();
