import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";

const UserModel = new Schema(
  {
    // _id: {
    //   unique: true,
    //   type: String,
    //   required: [true, "Please enter ID"],
    // },
    email: {
      unique: [true, "Email already exist"],
      type: String,
      trim: true,
      lowercase: true,
      required: [true, "Email is required"],
      validate: validator.default.isEmail,
    },
    userName: {
      unique: true,
      type: String,
      trim: true,
      lowercase: true,
      require: [true, "Username is required"],
    },
    avatar: {
      type: String,
      // required: [true, "Avatar is required"],
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "admin",
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      // required: [true, "Please enter gender"],
    },
    dob: {
      type: Date,
      // required: [true, "Please enter Dob"],
    },

    fullName: {
      type: String,
      // required: [true, "Full name is required"],
      index: true,
    },

    coverImage: {
      type: String,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    watchHistory: [{ type: Schema.Types.ObjectId, ref: "video" }],
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);
UserModel.virtual("age").get(() => {
  const today = new Date();
  const dob = this.dob;
  const age = today.getFullYear() - dob.getFullYear();
  if (
    today.getMonth() < dob.getMonth() ||
    (today.getMonth() == dob.getMonth() && today.getDay() < dob.getDay())
  ) {
    age--;
  }
  return age;
});

UserModel.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
UserModel.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};
UserModel.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      userName: this.userName,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};
UserModel.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

export const user = mongoose.model("user", UserModel);
