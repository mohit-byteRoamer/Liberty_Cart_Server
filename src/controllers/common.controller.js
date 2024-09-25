import fs from "fs";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const uploadSingleFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    console.log(
      "------------------------------UPLOAD_-_FILE------------------------------------------------"
    );

    const localFilePath = req.file.path;
    const uploadResult = await uploadOnCloudinary(localFilePath);

    if (uploadResult) {
      fs.unlinkSync(localFilePath); // Remove file from local storage after uploading
      return res.status(200).json({
        message: "Image uploaded successfully",
        imageUrl: uploadResult.url,
      });
    } else {
      return res
        .status(500)
        .json({ message: "Error uploading file to Cloudinary" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
