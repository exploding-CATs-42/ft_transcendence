import path from "node:path";
import multer, { FileFilterCallback } from "multer";
import { Request } from "express";

const generateFilename = (file: Express.Multer.File) => {
  return `${new Date().toISOString().replace(/:/g, "-")}-${file.originalname}`;
};

const photoStorage = multer.diskStorage({
  destination: (
    _req: Request,
    _file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void,
  ) => {
    cb(null, path.join(process.cwd(), "/uploads"));
  },

  filename: (
    _: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void,
  ) => {
    const filename = generateFilename(file);
    cb(null, filename);
  },
});

export const photoUpload = multer({
  storage: photoStorage,

  fileFilter: (
    _req: Request,
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
    fileSize: 2 * 1024 * 1024, // 2 MB
  },
});

export default photoUpload;
