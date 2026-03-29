import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

/**
 * Upload file buffer to Cloudinary
 * @param {Buffer} buffer
 * @returns {Promise<Object>} Cloudinary result
 */
export const uploadFromBuffer = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "profile_pictures",
        resource_type: "image", // explicit (good practice)
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          return reject(error);
        }
        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};