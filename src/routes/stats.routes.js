import { Router } from "express";
import { isAdmin, verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  getBarCharts,
  getDashboardStats,
  getLineCharts,
  getPieCharts,
} from "../controllers/stats.controller.js";

const dashboard = Router();
const middlewareArray = [verifyJWT, isAdmin];

dashboard.route("/stats").get(verifyJWT, isAdmin, getDashboardStats);
dashboard.route("/pie").get(...middlewareArray, getPieCharts);
dashboard.route("/bar").get(...middlewareArray, getBarCharts);
dashboard.route("/line").get(...middlewareArray, getLineCharts);

export default dashboard;
