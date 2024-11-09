import { myCache } from "../app.js";
import { product } from "../models/product.modal.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { faker } from "@faker-js/faker";
import { inValidatorCache } from "../utils/cacheHandler.js";

const createProduct = asyncHandler(async (req, res) => {
  const { name, price, stock, category, photo, description } = req.body;
  if (
    [name, price, stock, category, photo, description].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    return res.status(400).json(new ApiError(400, "All fields are required"));
  }

  const Product = await product.create({
    name,
    price,
    stock,
    category,
    photo,
    description,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, Product, "Product Created Successfully"));
});

const getLatestProduct = asyncHandler(async (req, res) => {
  let products = [];
  if (myCache.has("latestProduct")) {
    products = JSON.parse(myCache.get("latestProduct"));
  } else {
    products = await product.find({}).sort({ createdAt: -1 }).limit(5);
    myCache.set("latestProduct", JSON.stringify(products));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, products, "Latest Product Retrieved Successfully")
    );
});

const getProductCategory = asyncHandler(async (req, res) => {
  let productCategory = [];
  if (myCache.has("productCategory")) {
    productCategory = JSON.parse(myCache.get("productCategory"));
  } else {
    productCategory = await product.distinct("category");
    myCache.set("productCategory", JSON.stringify(productCategory));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        productCategory,
        "All Product Categories Retrieved Successfully"
      )
    );
});

const getAdminProducts = asyncHandler(async (req, res) => {
  let adminProduct = [];
  if (myCache.has("adminProduct")) {
    adminProduct = JSON.parse(myCache.get("adminProduct"));
  } else {
    adminProduct = await product.find({});
    myCache.set("adminProduct", JSON.stringify(adminProduct));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        adminProduct,
        "All Admin Products Retrieved Successfully"
      )
    );
});

const getSingleProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const cacheKey = `getSingleProduct-${id}`;

  try {
    let Product;
    if (myCache.has(cacheKey)) {
      Product = myCache.get(cacheKey);
    }
    if (!Product) {
      Product = await product.findById(id);

      if (Product == null) {
        console.log("product", Product);
        throw new ApiError(404, "Invalid Product Id");
      }

      myCache.set(cacheKey, JSON.stringify(Product));
    } else {
      Product = JSON.parse(Product);
    }

    return res
      .status(200)
      .json(new ApiResponse(200, Product, "Product Retrieved Successfully"));
  } catch (error) {
    console.log("error", error);
    if (error.name === "CastError" && error.kind === "ObjectId") {
      throw new ApiError(400, "Invalid ObjectId format");
    }

    throw new ApiError(400, "Internal Server Error");
  }
});

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, price, stock, category } = req.body;
  console.log(name, price, stock, category, "UPDATE");

  const productImage = req.file;
  const Product = await product.findById(id);

  if (!Product) {
    throw new ApiError(404, "Invalid Product Id");
  }
  if (name) Product.name = name;
  if (price) Product.price = price;
  if (stock) Product.stock = stock;
  if (category) Product.category = category;
  await Product.save();
  await inValidatorCache({ Product: true });

  return res
    .status(200)
    .json(new ApiResponse(200, Product, "Product Updated Successfully"));
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const Product = await product.findById(id);

  if (!Product) {
    throw new ApiError(404, "Invalid Product Id");
  }
  await product.findByIdAndDelete(id);
  await inValidatorCache({ Product: true });

  return res
    .status(200)
    .json(new ApiResponse(200, Product, "Product Deleted Successfully"));
});

const getAllProducts = asyncHandler(async (req, res) => {
  const { search, sort, category, price } = req.query;
  console.log();
  
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const baseQuery = {};

  if (search)
    baseQuery.name = {
      $regex: search,
      $options: "i",
    };

  if (price)
    baseQuery.price = {
      $lte: Number(price),
    };

  if (category) baseQuery.category = category;

  const [Products, filteredOnlyProduct] = await Promise.all([
    product
      .find(baseQuery)
      .sort(sort ? { price: sort === "asc" ? 1 : -1 } : undefined)
      .limit(limit)
      .skip(skip),
    product.find(baseQuery),
  ]);

  const totalPage = Math.ceil(filteredOnlyProduct.length / limit);
  console.log(Products.length, filteredOnlyProduct.length, "length");
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { Products, totalPage },
        "Products Fetched Successfully"
      )
    );
});

export {
  createProduct,
  getLatestProduct,
  getProductCategory,
  getAdminProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
};

