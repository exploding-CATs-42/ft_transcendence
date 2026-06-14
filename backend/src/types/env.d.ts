declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    NODE_ENV: string;
    PORT: string;
    DATABASE_URL: string;
    FRONTEND_URL: string;
    JWT_ACCESS_SECRET: string;
    JWT_REFRESH_SECRET: string;
    JWT_ACCESS_EXPIRES_IN: string;
    JWT_REFRESH_EXPIRES_IN: string;
    GAME_PERSISTENCE_FILE_PATH: string;
  }
}
