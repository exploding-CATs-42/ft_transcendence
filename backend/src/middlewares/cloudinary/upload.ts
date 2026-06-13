import path from "node:path";
import multer from "multer";
import { Request } from "express";

const photoStorage = multer.diskStorage({
  destination: (
    _req: Request,
    _file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void,
  ) => {
    cb(null, path.join(process.cwd(), "/uploads"));
  },
});
