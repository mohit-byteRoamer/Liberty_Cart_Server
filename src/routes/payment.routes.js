import { Router } from "express";
import {
  applyDiscount,
  createCoupon,
  deleteCoupon,
  getAllCoupon,
} from "../controllers/payment.controller.js";
import { isAdmin, verifyJWT } from "../middlewares/auth.middlewares.js";

const paymentRouter = Router();

// User Router
paymentRouter.route("/discount").get(verifyJWT, applyDiscount);

// Admin Router
paymentRouter.route("/coupon-create").post(verifyJWT, isAdmin, createCoupon);
paymentRouter.route("/all-coupons").get(verifyJWT, isAdmin, getAllCoupon);
paymentRouter.route("/:id").get().delete(verifyJWT, isAdmin, deleteCoupon);

export default paymentRouter;
