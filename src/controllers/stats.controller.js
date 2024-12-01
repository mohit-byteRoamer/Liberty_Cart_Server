import { myCache } from "../app.js";
import { Order } from "../models/order.modal.js";
import { product } from "../models/product.modal.js";
import { user } from "../models/user.modal.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { calculatePercentage, getChartData } from "../utils/global-function.js";
import moment from "moment";

const getDashboardStats = asyncHandler(async (req, res) => {
  // let data;

  // if (myCache.has(`admin-stats`)) {
  //   data = JSON.parse(myCache.get(`admin-stats`));
  // } else {
  // today, startOfLastMonth, endOfLastMonth, currentDate,

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
    categories,
    topTransaction,
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
    product.distinct("category"),
    Order.aggregate([
      {
        $project: {
          discount: 1,
          total: 1,
          status: 1,
          orderItemsLength: { $size: "$orderItems" }, // Add the length of orderItems
        },
      },
      { $limit: 4 }, // Limit the results to 4
    ]),
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
    (total, order) => total + (Number(order.total) || 0),
    0
  );

  const lastMonthRevenue = lastMonthOrders.reduce(
    (total, order) => total + (Number(order.total) || 0),
    0
  );

  const statsRevenue = calculatePercentage(thisMonthRevenue, lastMonthRevenue);

  const stats = {
    revenue: `${statsRevenue}%`,
    user: `${User}%`,
    product: `${Product}%`,
    order: `${order}%`,
  };

  const countRevenue = orderCount.reduce((total, val) => total + val.total, 0);
  const count = {
    revenue: countRevenue,
    userCount,
    productCount,
    orderCount: orderCount.length,
  };

  const categoriesCount = await Promise.all(
    categories.map(async (item) => ({
      label: item,
      length:
        Math.round(
          ((await product.countDocuments({ category: item })) / productCount) *
            100
        ) + "%",
    }))
  );

  const data = {
    stats,
    inventory: categoriesCount,
    count,
    topTransaction,
  };
  myCache.set(`admin-stats`, JSON.stringify(data));

  return res
    .status(200)
    .json(
      new ApiResponse(200, data, "Dashboard Stats Data Fetched Successfully")
    );
});

const getPieCharts = asyncHandler(async (req, res) => {
  let charts;

  const [
    processingOrders,
    shippedOrders,
    deliveredOrders,
    categories,
    productCount,
    productOutOfStock,
    allOrders,
    allAdmins,
    allUsers,
  ] = await Promise.all([
    Order.countDocuments({ status: "Processing" }),
    Order.countDocuments({ status: "Shipped" }),
    Order.countDocuments({ status: "Delivered" }),
    product.distinct("category"),
    product.countDocuments(),
    product.countDocuments({ stock: 0 }),
    Order.find({}).select([
      "subtotal",
      "tax",
      "shippingCharges",
      "discount",
      "total",
    ]),
    user.countDocuments({ role: "admin" }),
    user.countDocuments({ role: "user" }),
  ]);

  const orderFullFillment = {
    processingOrders,
    shippedOrders,
    deliveredOrders,
  };

  const productCategory = await Promise.all(
    categories.map(async (item) => ({
      label: item,
      length:
        Math.round(
          ((await product.countDocuments({ category: item })) / productCount) *
            100
        ) + "%",
    }))
  );

  const stockAvailability = {
    inStock: productCount - productOutOfStock,
    outOfStock: productOutOfStock,
  };

  const grossIncome = allOrders.reduce(
    (pre, order) => pre + (order.total || 0),
    0
  );

  const discount = allOrders.reduce(
    (pre, order) => pre + (order.discount || 0),
    0
  );

  const productionCost = allOrders.reduce(
    (pre, order) => pre + (order.shippingCharges || 0),
    0
  );

  const burnt = allOrders.reduce((pre, order) => pre + (order.tax || 0), 0);

  const markettingCost = Math.round(grossIncome * (30 / 100));

  const netMargin =
    grossIncome - discount - productionCost - burnt - markettingCost;
  const revenueDistribution = {
    netMargin,
    discount,
    productionCost,
    burnt,
    markettingCost,
  };

  const adminUsers = {
    allAdmins,
    allUsers,
  };

  charts = {
    orderFullFillment,
    productCategory,
    stockAvailability,
    revenueDistribution,
    adminUsers,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, charts, "Pie Chart Data Fetched Successfully"));
});

const getBarCharts = asyncHandler(async (req, res) => {
  const date = new Date();

  let sixMonthsAgo = new Date(date);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  let twelveMonthsAgo = new Date(date);
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const [sixMonthsProducts, sixMonthsUsers, twelveMonthsOrders] =
    await Promise.all([
      product.find({ createdAt: { $gte: sixMonthsAgo, $lte: date } }),
      user.find({ createdAt: { $gte: sixMonthsAgo, $lte: date } }),
      Order.find({ createdAt: { $gte: twelveMonthsAgo, $lte: date } }),
    ]);

  const productsCount = getChartData({
    docArray: sixMonthsProducts,
    length: 6,
    today: date,
  });

  const usersCount = getChartData({
    docArray: sixMonthsUsers,
    length: 6,
    today: date,
  });

  const ordersCount = getChartData({
    docArray: twelveMonthsOrders,
    length: 6,
    today: date,
  });

  const chart = {
    productsCount,
    usersCount,
    ordersCount,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, chart, "Bar Chart Data Fetched Successfully"));
});

const getLineCharts = asyncHandler(async (req, res) => {
  const date = new Date();

  let twelveMonthsAgo = new Date(date);
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const baseQuery = { createdAt: { $gte: twelveMonthsAgo, $lte: date } };

  const [twelveMonthsProducts, twelveMonthsUsers, twelveMonthsOrders] =
    await Promise.all([
      product.find(baseQuery),
      user.find(baseQuery),
      Order.find(baseQuery),
    ]);

  const productsCount = getChartData({
    docArray: twelveMonthsProducts,
    length: 12,
    today: date,
  });

  const usersCount = getChartData({
    docArray: twelveMonthsUsers,
    length: 12,
    today: date,
  });

  const discount = getChartData({
    docArray: twelveMonthsOrders,
    length: 12,
    today: date,
    property: "discount",
  });

  const revenue = getChartData({
    docArray: twelveMonthsOrders,
    length: 12,
    today: date,
    property: "total",
  });

  const chart = {
    productsCount,
    usersCount,
    discount,
    revenue,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, chart, "Line Chart Data Fetched Successfully"));
});

export { getDashboardStats, getPieCharts, getBarCharts, getLineCharts };
