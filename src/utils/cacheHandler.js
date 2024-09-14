import { myCache } from "../app.js";
import { product } from "../models/product.modal.js";

const inValidatorCache = async ({ Product, order, admin }) => {
  if (Product) {
    const productKey = ["latestProduct", "productCategory", "adminProduct"];

    const productId = await product.find({}).select("_id");
    if (productId.length > 0) {
      // productId.forEach((element) =>
      //   productKey.push(`getSingleProduct-${element._id}`)
      // );
    }
    myCache.del(productKey);
  }

  if (order) {
    const cacheKeys = myCache.keys();
    const orderKeysArray = cacheKeys.filter((val) => val.startsWith("order-"));
    myCache.del(orderKeysArray);
  }

  if (admin) {
  }
};

export { inValidatorCache };
