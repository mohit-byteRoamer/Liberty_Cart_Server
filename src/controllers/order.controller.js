import { myCache } from "../app.js";
import { Order } from "../models/order.modal.js";
import { user } from "../models/user.modal.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { inValidatorCache } from "../utils/cacheHandler.js";

const newOrder = asyncHandler(async (req, res) => {
  const {
    shippingInfo,
    user,
    subTotal,
    tax,
    shippingCharges,
    discount,
    total,
    status,
    orderItems,
  } = req.body;

  if (
    [
      shippingInfo,
      user,
      subTotal,
      tax,
      shippingCharges,
      discount,
      total,
      status,
      orderItems,
    ].some((val) => val == "" || val == undefined)
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const order = await Order.create({
    shippingInfo,
    user,
    subTotal,
    tax,
    shippingCharges,
    discount,
    total,
    status,
    orderItems,
  });
  await inValidatorCache({ order: true });

  res
    .status(200)
    .json(new ApiResponse(200, order, "Order created successfully"));
});

const myOrders = asyncHandler(async (req, res) => {
  const { id } = req.query;
  if (!id) {
    throw new ApiError(404, "Provide a valid User id");
  }

  let orders = [];

  if (myCache.has(`order-myOrders${id}`)) {
    orders = JSON.parse(myCache.get(`order-myOrders${id}`));
  } else {
    orders = await Order.find({ user: id }).populate("user", "userName"); // Use 'id' here
    myCache.set(`order-myOrders${id}`, JSON.stringify(orders));
  }

  if (orders.length === 0) {
    throw new ApiError(404, "No orders found for the specified user.");
  }

  res
    .status(200)
    .json(new ApiResponse(200, orders, "My Orders Fetched Successfully"));
});

const getAllOrders = asyncHandler(async (req, res) => {
  let allOrders = [];
  if (myCache.has("order-getAllOrders")) {
    allOrders = JSON.parse(myCache.get("order-getAllOrders"));
  } else {
    allOrders = await Order.find().populate("user", "userName");
    myCache.set("order-getAllOrders", JSON.stringify(allOrders));
  }

  if (allOrders.length === 0) {
    throw new ApiError(404, "No orders found for the specified user.");
  }
  res
    .status(200)
    .json(new ApiResponse(200, allOrders, "All Orders Fetched Successfully"));
});

const processOrders = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(404, "Provide valid order id");
  }

  const order = await Order.findById(id);

  if (!order) {
    throw new ApiError(404, "Invalid Order id");
  }

  switch (order.status) {
    case "Processing":
      order.status = "Shipped";
      break;
    case "Shipped":
      order.status = "Delivered";
      break;
    default:
      "Delivered";
      break;
  }
  await order.save();
  await inValidatorCache({ order: true });

  res
    .status(200)
    .json(new ApiResponse(200, order, "Orders Processed Successfully"));
});

const getSingleOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(404, "Provide valid order id");
  }

  let order = [];

  if (myCache.has(`order-getSingleOrder${id}`)) {
    order = JSON.parse(myCache.get(`order-getSingleOrder${id}`));
  } else {
    order = await Order.findById(id).populate("user", "userName");
    myCache.set(`order-getSingleOrder${id}`, JSON.stringify(order));
  }

  if (!order) {
    throw new ApiError(404, "Invalid Order id");
  }

  await res
    .status(200)
    .json(new ApiResponse(200, order, "Order Fetched Successfully"));
});

const updateOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(404, "Provide valid order id");
  }
  const {
    shippingInfo,
    subTotal,
    tax,
    shippingCharges,
    discount,
    total,
    status,
    orderItems,
  } = req.body;

  const order = await Order.findById(id);

  if (!order) {
    throw new ApiError(404, "Invalid Order id");
  }

  if (shippingInfo) order.shippingInfo = shippingInfo;
  if (subTotal) order.subTotal = subTotal;
  if (tax) order.tax = tax;
  if (shippingCharges) order.shippingCharges = shippingCharges;
  if (discount) order.discount = discount;
  if (total) order.total = total;
  if (status) order.status = status;
  if (orderItems) order.orderItems = orderItems;

  await order.save();
  await inValidatorCache({ order: true });

  res
    .status(200)
    .json(new ApiResponse(200, order, "Order updated successfully"));
});

const deleteOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(404, "Provide valid order id");
  }

  const order = await Order.findById(id);

  if (!order) {
    throw new ApiError(404, "Invalid Order id");
  }

  await Order.findByIdAndDelete(id);
  await inValidatorCache({ order: true });

  await res
    .status(200)
    .json(new ApiResponse(200, order, "Order Deleted Successfully"));
});

export {
  newOrder,
  updateOrder,
  deleteOrder,
  getSingleOrder,
  myOrders,
  getAllOrders,
  processOrders,
};
