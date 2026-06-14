import multer, { FileFilterCallback } from "multer";
import { Request } from "express";

const photoStorage = multer.memoryStorage();

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
