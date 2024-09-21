import { user } from "../models/user.modal.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
export const AuthMiddleWares = () => {
  const User = user.findById(id);
};

// - - - - - Step for verify-JWT user - - - - -
// first get accessToken and throw a error if not
// second verify with secret key
// now you have user id after verify token and find user by id and throw a error if user not exist
// and last assign user in req.user and call next function
export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json(new ApiError(401, "Unauthorized request"));
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const User = await user
      .findById(decodedToken._id)
      .select("-password,-refreshToken");
    if (!User) {
      return res.status(401).json(new ApiError(401, "Invalid Access Token"));
    }
    req.user = User;
    next();
  } catch (error) {
    return res
      .status(402)
      .json(new ApiError(402, error?.message || "Invalid access token"));
  }
});

export const isAdmin = (req, _, next) => {
  console.log("ISADMIN");

  if (req.user.role !== "admin") {
    throw new ApiError(403, "Permission denied. User is not an admin");
  }
  next();
};
