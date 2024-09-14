import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
//routes import
import userRouter from "./routes/user.routes.js";
import productRouter from "./routes/product.routes.js";
import NodeCache from "node-cache";
import morgan from "morgan";
import orderRouter from "./routes/order.routes.js";
import bodyParser from "body-parser"; // Importing body-parser
import paymentRouter from "./routes/payment.routes.js";
import dashboard from "./routes/stats.routes.js";

export const myCache = new NodeCache();

const app = express();
const apiVersion = "/api/v1";
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(bodyParser.json({ limit: "16kb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(morgan("dev"));

//routes declaration
app.get("/", (req, res) => {
  res.send("Hello, Vercel!");
});

app.use(`${apiVersion}/users`, userRouter);
app.use(`${apiVersion}/product`, productRouter);
app.use(`${apiVersion}/order`, orderRouter);
app.use(`${apiVersion}/payment`, paymentRouter);
app.use(`${apiVersion}/dashboard`, dashboard);

export { app };
