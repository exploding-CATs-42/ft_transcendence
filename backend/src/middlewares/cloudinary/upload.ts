import path from "node:path";
import multer, { FileFilterCallback } from "multer";
import { Request } from "express";

// Photo Storage
const photoStorage = multer.diskStorage({
  destination: (
    _: Request,
    __: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void,
  ) => {
    cb(null, path.join(__dirname, "../images"));
  },

  filename: (
    _: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void,
  ) => {
    const filename = `${new Date().toISOString().replace(/:/g, "-")}-${file.originalname}`;

    cb(null, filename);
  },
});

// Photo Upload Middleware
export const photoUpload = multer({
  storage: photoStorage,

  fileFilter: (
    _: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
      return;
    }

    cb(new Error("Unsupported file format"));
  },

  limits: {
    fileSize: 1024 * 1024, // 1 MB
  },
});

export default photoUpload;
