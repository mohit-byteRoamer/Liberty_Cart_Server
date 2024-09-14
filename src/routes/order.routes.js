import { Router } from "express";
import {
  deleteOrder,
  getAllOrders,
  getSingleOrder,
  myOrders,
  newOrder,
  processOrders,
  updateOrder,
} from "../controllers/order.controller.js";
import { isAdmin, verifyJWT } from "../middlewares/auth.middlewares.js";

const orderRouter = Router();

// User Router
orderRouter.route("/new").post(verifyJWT, newOrder);
orderRouter.route("/my").get(verifyJWT, myOrders);
orderRouter.route("/allOrder").get(verifyJWT, getAllOrders);

// Admin Router
orderRouter.route("/process/:id").patch(verifyJWT, isAdmin, processOrders);

orderRouter
  .route("/:id")
  .get(verifyJWT, getSingleOrder)
  .put(verifyJWT, updateOrder)
  .delete(verifyJWT, deleteOrder);

export default orderRouter;
