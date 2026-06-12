import { Readable } from "node:stream";
import { UploadApiResponse } from "cloudinary";

const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: process.env["CLOUDINARY_CLOUD_NAME"],
  api_key: process.env["CLOUDINARY_API_KEY"],
  api_secret: process.env["CLOUDINARY_API_SECRET"],
});

export const cloudinaryUploadImage = (
  file: Express.Multer.File,
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
      },
      (error: any, result: any) => {
        if (error || !result) {
          return reject(error);
        }
        resolve(result);
      },
    );

    const bufferStream = Readable.from(file.buffer);
    bufferStream.pipe(uploadStream);
  });
};

// Cloudinary Remove Image
const cloudinaryRemoveImage = async (imagePublicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(imagePublicId);
    return result;
  } catch (error) {
    console.log(error);
    throw new Error("Internal Server Error (cloudinary)");
  }
};

// Cloudinary Remove Multiple Image
const cloudinaryRemoveMultipleImage = async (publicIds: string[]) => {
  try {
    const result = await cloudinary.v2.api.delete_resources(publicIds);
    return result;
  } catch (error) {
    console.log(error);
    throw new Error("Internal Server Error (cloudinary)");
  }
};

export default {
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
  cloudinaryRemoveMultipleImage,
};
