import { v2 as cloudinary } from "cloudinary";

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

const uploadImage = async (fileToUpload: string) => {
  const data = await cloudinary.uploader.upload(fileToUpload, {
    resource_type: "auto",
  });
  return data;
};

const removeImage = async (imagePublicId: string) => {
  const result = await cloudinary.uploader.destroy(imagePublicId);
  return result;
};

export default { uploadImage, removeImage };
