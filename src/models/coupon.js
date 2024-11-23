import mongoose, { Schema, model } from "mongoose";

const Coupon = new Schema({
  code: {
    type: String,
    required: [true, "Code is required"],
    unique: true,
  },
  amount: {
    type: Number,
    required: [true, "Amount is required"],
  },
});

const coupon = model("coupon", Coupon);

export default coupon;
