import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import {
  createProduct,
  deleteProduct,
  getAdminProducts,
  getAllProducts,
  getLatestProduct,
  getProductCategory,
  getSingleProduct,
  updateProduct,
} from "../controllers/product.controller.js";
import { isAdmin, verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

// User Router
router.route("/latest").get(verifyJWT, getLatestProduct);
router.route("/all").get(verifyJWT, getAllProducts);

// Admin Router
router
  .route("/new")
  .post(
    verifyJWT,
    isAdmin,
    upload.fields([{ name: "photo", maxCount: 1 }]),
    createProduct
  );
router.route("/category").get(verifyJWT, isAdmin, getProductCategory);
router.route("/admin-products").get(verifyJWT, isAdmin, getAdminProducts);

// Common
router
  .route("/:id")
  .get(verifyJWT, getSingleProduct)
  .put(
    verifyJWT,
    isAdmin,
    upload.fields([{ name: "photo", maxCount: 1 }]),
    updateProduct
  )
  .delete(verifyJWT, isAdmin, deleteProduct);

// router.route("/all").get(getAllProducts);

export default router;
