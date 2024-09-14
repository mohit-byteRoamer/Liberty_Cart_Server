import mongoose, { Schema } from "mongoose";

const OrderModal = new Schema(
  {
    shippingInfo: {
      address: {
        type: String,
        required: [true, "Address is required"],
      },
      city: {
        type: String,
        required: [true, "City is required"],
      },
      state: {
        type: String,
        required: [true, "State is required"],
      },
      country: {
        type: String,
        required: [true, "Country is required"],
      },
      pinCode: {
        type: Number,
        required: [true, "Pin code is required"],
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "User id is required"],
    },
    subTotal: {
      type: String,
      required: true,
    },
    tax: {
      type: String,
      required: true,
    },
    shippingCharges: {
      type: String,
      required: true,
    },
    discount: {
      type: String,
      required: true,
    },
    total: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Processing", "Shipped", "Delivered"],
      default: "Processing",
    },
    orderItems: [
      {
        name: String,
        photo: String,
        price: String,
        quantity: Number,
        productId: {
          type: mongoose.Types.ObjectId,
          ref: "product",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model("order", OrderModal);
