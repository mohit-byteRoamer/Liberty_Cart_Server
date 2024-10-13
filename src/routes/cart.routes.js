import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  updateProductToCart,
  getCartProducts,
  deleteCartProduct,
} from "../controllers/cart.controller.js";

const cartRouter = Router();

cartRouter.route("/update-cart").post(verifyJWT, updateProductToCart);

cartRouter.route("/list").get(verifyJWT, getCartProducts);
cartRouter.route("/delete/:id").delete(verifyJWT, deleteCartProduct);

export default cartRouter;
