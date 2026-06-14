import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
  process.env;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  throw new Error("Missing Cloudinary environment variables");
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

import { UploadApiResponse } from "cloudinary";

const uploadImage = async (
  file: Express.Multer.File,
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream((error, result) => {
      if (error) return reject(error);
      if (!result) return reject(new Error("Upload failed"));

      resolve(result);
    });

    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};

const removeImage = async (imagePublicId: string) => {
  const result = await cloudinary.uploader.destroy(imagePublicId);
  return result;
};

export default { uploadImage, removeImage };
