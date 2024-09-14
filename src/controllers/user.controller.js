import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { user } from "../models/user.modal.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// - - - - - Step for register user - - - - -
// Unpack Body
// Check Required item is empty
// Check user exist in db with email
// Get path of file like image PDF
// upload image on cloud
// Then try to Create User
// return user with not necessary like password refresh-token

const registerUser = asyncHandler(async (req, res) => {
  const { userName, email, fullName, avatar, coverImage, password } = req.body;
  // if (
  //   [userName, email, fullName, avatar, password].some(
  //     (field) => field?.trim() == ""
  //   )
  // ) {
  //   new ApiError(400, "All fields are required");
  // }

  if (
    [userName, email, password].some(
      (field) => field?.trim() == ""
    )
  ) {
    return res
      .status(400)
      .json(new ApiError(400, "All fields are required"));
  }

  const existedUser = await user.findOne({ $or: [{ userName }, { email }] });

  if (existedUser !== null) {
    return res
      .status(209)
      .json(new ApiError(409, "User with email or username already exists"));
  }
  // const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  // if (!avatarLocalPath) {
  //   throw new ApiError(400, "Avatar file is required");
  // }
  // const isUploadAvatar = await uploadOnCloudinary(avatarLocalPath);
  // const isUploadCoverImage = await uploadOnCloudinary(coverImageLocalPath);
  // if (!isUploadAvatar) {
  //   throw new ApiError(400, "Avatar file is required");
  // }
  const saveUser = await user.create({
    userName: userName.toLowerCase(),
    email,
    fullName,
    // avatar: isUploadAvatar?.url,
    // coverImage: isUploadCoverImage?.url || "",
    password,
  });
  const createUser = await user
    .findById(saveUser._id)
    .select("-password -refreshToken"); // To Unselect Properties
  if (!createUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  } else {
    return res
      .status(201)
      .json(new ApiResponse(201, createUser, "User created successfully"));
  }
});

// - - - - - Step for login user - - - - -
// Check Required filed is empty
// Check user exist in db with email
// Check password is correct
// Create refresh tokens
const loginUser = asyncHandler(async (req, res) => {
  const { email, userName, password } = req.body;

  if ([email, password].some((val) => val == "")) {
    return res.status(400).json(new ApiError(400, "All fields are required"));
  }

  const User = await user.findOne({ $or: [{ email }, { userName }] });
  if (!User) {
      return res
        .status(409)
        .json(new ApiError(409, "User not found"));
  }
  const isPasswordCorrect = await User.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
     return res.status(401).json(new ApiError(401, "Incorrect password"));
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    User._id
  );
  const loggedUser = await user
    .findById(User.id)
    .select("-password -refreshToken");
  const option = {
    httpOnly: true,
    secure: true,
    // True mean of both Cookies can modify only server side not client side
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
      new ApiResponse(
        200,
        { user: loggedUser, accessToken, refreshToken },
        "User logged successFully "
      )
    );
});

// - - - - - Step for logout user - - - - -
// Check Required filed is empty
// Check user exist in db with email
// remove refresh tokens
const logoutUser = asyncHandler(async (req, res) => {
  console.log(req, "logoutUser");
  await user.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    { new: true }
  );

  const option = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", option)
    .clearCookie("refreshToken", option)
    .json(new ApiResponse(200, {}, "User logged Out Successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }
  const decodeRefreshToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );
  const User = user.findById(decodeRefreshToken._id);
  if (!User) {
    throw new ApiError(401, "invalid refresh token");
  }
  if (incomingRefreshToken !== User?.refreshToken) {
    throw new ApiError(401, "Refresh token is expired and used");
  }
  const option = {
    httpOnly: true,
    secure: true,
  };
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    User._id
  );

  const loggedUser = await user
    .findById(User._id)
    .select("-password -refreshToken");

  return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(new ApiResponse(200, { user: loggedUser, acc }));
});

// - - - - - Step for change current password - - - - -
// first get oldPassword and newPassword
// Check user exist in db with userId which will provide verifyJWT middlewares
// Check user oldPassword is correct with jwt
// Now user can replace password

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { newPassword, oldPassword } = req.body;
  const { _id } = req.user;
  if ([newPassword, oldPassword].some((val) => val !== "")) {
    throw new ApiError(401, "OldPassword and newPassword are required.");
  }
  const User = await user.findById(_id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password!.");
  }
  User.password = newPassword;
  await User.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiError(200, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(200, new ApiResponse(req.user), "Current user fetched successfully");
});

const updateAccountDetail = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  const User = await user
    .findByIdAndUpdate(
      req.user._id,
      {
        $set: { fullName, email },
      },
      { new: true }
    )
    .select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, User, "Account details update successfully."));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file.path;
  if (!avatarLocalPath) {
    new ApiError(400, "Avatar file is missing.");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar.url) {
    new ApiError(400, "Error while uploading on avatar.");
  }
  await user
    .findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          avatar: avatar.url,
        },
      },
      { new: true }
    )
    .select("-password");
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    new ApiError(400, "Cover image is missing.");
  }
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!coverImage?.url) {
    new ApiError(400, "Error while uploading on cover image.");
  }
  await user
    .findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          coverImage: coverImage?.url,
        },
      },
      { new: true }
    )
    .select("-password");
});

const getUserChannelDetail = asyncHandler(async (req, res) => {
  const { userName } = req.params;
  if (!userName?.trim()) {
    throw new ApiError(400, "UserName is missing");
  }
  const channels = await user.aggregate([
    {
      $match: {
        userName: userName?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo ",
      },
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "$subscribers",
        },
        channelsSubscriberToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        userName: 1,
        subscriberCount: 1,
        channelsSubscriberToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  if (!channels.length) {
    throw new ApiError(404, "Channel does not exists");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        channels[0],
        "User channel detail fetched successfully."
      )
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const User = await user.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(req.user._id) },
    },
    {
      $lookup: {
        from: "Video",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    userName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        User[0].watchHistory,
        "User watchHistory fetched successfully"
      )
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetail,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelDetail,
  getWatchHistory,
};

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const User = await user.findById(userId);
    const accessToken = User.generateAccessToken();
    const refreshToken = User.generateRefreshToken();
    User.refreshToken = refreshToken;
    await User.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);
  }
};
