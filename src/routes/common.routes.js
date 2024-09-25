import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import { uploadSingleFile } from "../controllers/common.controller.js";

const commonRouter = Router();

// Define the route for a single image upload
commonRouter.route("/uploadFile").post(
  upload.single("image"), // 'image' is the name of the field in form-data
  uploadSingleFile
);

export default commonRouter;
