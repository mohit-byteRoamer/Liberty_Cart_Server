import { myCache } from "../app.js";
import { Order } from "../models/order.modal.js";
import { product } from "../models/product.modal.js";
import { user } from "../models/user.modal.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { calculatePercentage } from "../utils/global-function.js";
import moment from "moment";

const getDashboardStats = asyncHandler(async (req, res) => {
  let data;

  if (myCache.has(`admin-stats`)) {
    data = JSON.parse(myCache.get(`admin-stats`));
  } else {
    const today = new Date();
    const startOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    // Get the current date
    const currentDate = moment();

    // Subtract six months from the current date
    const sixMonthsAgo = currentDate.subtract(6, "months");

    // Display the result
    console.log("Six months ago:", sixMonthsAgo.format("YYYY-MM-DD"));

    const [
      thisMonthUsers,
      lastMonthUsers,
      thisMonthProducts,
      lastMonthProducts,
      thisMonthOrders,
      lastMonthOrders,
      userCount,
      productCount,
      orderCount,
    ] = await Promise.all([
      user.find({
        createdAt: { $gte: startOfThisMonth, $lte: today },
      }),
      user.find({
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
      }),
      product.find({ createdAt: { $gte: startOfThisMonth, $lte: today } }),
      product.find({
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
      }),
      Order.find({ createdAt: { $gte: startOfThisMonth, $lte: today } }),
      Order.find({
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
      }),
      user.countDocuments(),
      product.countDocuments(),
      Order.find({}).select("total"),
    ]);

    const User = calculatePercentage(
      thisMonthUsers.length,
      lastMonthUsers.length
    );
    const Product = calculatePercentage(
      thisMonthProducts.length,
      lastMonthProducts.length
    );
    const order = calculatePercentage(
      thisMonthOrders.length,
      lastMonthOrders.length
    );

    const thisMonthRevenue = thisMonthOrders.reduce(
      (total, order) => total + (order.total || 0),
      0
    );
    const lastMonthRevenue = lastMonthOrders.reduce(
      (total, order) => total + (order.total || 0),
      0
    );

    const statsRevenue = calculatePercentage(
      thisMonthRevenue,
      lastMonthRevenue
    );

    const stats = {
      revenue: `${statsRevenue}%`,
      user: `${User}%`,
      product: `${Product}%`,
      order: `${order}%`,
    };

    const countRevenue = orderCount.reduce(
      (total, val) => total + val.total,
      0
    );
    const count = {
      revenue: countRevenue,
      userCount,
      productCount,
      orderCount: orderCount.length,
    };

    const data = {
      stats,
      count,
    };
    myCache.set(`admin-stats`, JSON.stringify(data));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, data, "Dashboard Stats Data Fetched Successfully")
    );
});

const getPieCharts = asyncHandler(async (req, res) => {
  let stats;
  if (myCache.has(`admin-pie`)) {
    stats = JSON.parse(myCache.get(`admin-pie`));
  } else {
    stats = await Order.findById(id).populate("user", "userName");
    myCache.set(`admin-pie`, JSON.stringify(stats));
  }

  return res
    .stats(200)
    .json(new ApiResponse(200, stats, "Pie Chart Data Fetched Successfully"));
});
const getBarCharts = asyncHandler(async (req, res) => {
  let stats;
  if (myCache.has(`admin-bar`)) {
    stats = JSON.parse(myCache.get(`admin-bar`));
  } else {
    stats = await Order.findById(id).populate("user", "userName");
    myCache.set(`admin-bar`, JSON.stringify(stats));
  }
  return res
    .stats(200)
    .json(new ApiResponse(200, stats, "Bar Chart Data Fetched Successfully"));
});
const getLineCharts = asyncHandler(async (req, res) => {
  let stats;
  if (myCache.has(`admin-line`)) {
    stats = JSON.parse(myCache.get(`admin-line`));
  } else {
    stats = await Order.findById(id).populate("user", "userName");
    myCache.set(`admin-line`, JSON.stringify(stats));
  }
  return res
    .stats(200)
    .json(new ApiResponse(200, stats, "Line Chart Data Fetched Successfully"));
});

export { getDashboardStats, getPieCharts, getBarCharts, getLineCharts };
