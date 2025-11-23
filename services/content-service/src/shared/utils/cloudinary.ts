import { v2 as cloudinary } from "cloudinary";
import { config } from "../../config/app.config";

// configure cloudinary using env vars from app config
cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
});

export const uploadBufferToCloudinary = (
  buffer: Buffer,
  filename?: string,
  folder?: string
) => {
  return new Promise<any>((resolve, reject) => {
    const opts: any = { resource_type: "image" };
    if (folder) opts.folder = folder;

    const stream = cloudinary.uploader.upload_stream(
      opts,
      (error: any, result: any) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(buffer);
  });
};

export default cloudinary;
