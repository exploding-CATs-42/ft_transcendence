import "dotenv/config";
import app from "./app";
import { ensureDatabaseConnection } from "./utils/database";

const { PORT = 3000 } = process.env;

async function startServer() {
  try {
    await ensureDatabaseConnection();

    console.log("Database connection established");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    const msg =
      (error as Error).message.split("Message: `")[1]?.replace("`", "") ??
      (error as Error).message;
    console.error("Database connection failed:", msg);
    process.exit(1);
  }
}

startServer();
