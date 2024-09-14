import coupon from "../models/coupon.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createCoupon = asyncHandler(async (req, res) => {
  const { code, amount } = req.body;

  if (!code && !amount) {
    throw new ApiError(404, "Provide invalid coupon");
  }

  const Coupon = await coupon.create({ code, amount });

  await res
    .status(200)
    .json(new ApiResponse(200, Coupon, "Coupon Created Successfully"));
});

const getAllCoupon = asyncHandler(async (req, res) => {
  const coupons = await coupon.find({});

  await res
    .status(200)
    .json(new ApiResponse(200, coupons, "All Coupons get Successfully"));
});

const deleteCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log(id);
  if (!id) new ApiError(404, "Invalid Coupon Id");
  await coupon.findByIdAndDelete(id);

  await res
    .status(200)
    .json(new ApiResponse(200, "Coupons Deleted Successfully"));
});

const applyDiscount = asyncHandler(async (req, res) => {
  const { code } = req.query;

  const Coupon = await coupon.findOne({ code });

  if (Coupon == null || Coupon == undefined)
    throw new ApiError(404, "Invalid Coupon");

  await res
    .status(200)
    .json(new ApiResponse(200, Coupon.amount, "Discount Apply Successfully"));
});

export { createCoupon, getAllCoupon, deleteCoupon, applyDiscount };
