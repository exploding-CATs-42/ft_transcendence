import { CorsOptions } from "cors";

const { FRONTEND_URL = "*" } = process.env;

export const corsOptions: CorsOptions = {
  origin: FRONTEND_URL === "*" ? true : FRONTEND_URL,
  credentials: true,
  optionsSuccessStatus: 200
};
