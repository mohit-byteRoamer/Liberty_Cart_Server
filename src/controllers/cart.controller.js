import Cart from "../models/cart.modal.js";

export const updateProductToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, action } = req.body;

    let existingCartProduct = await Cart.findOne({ userId, productId });

    if (existingCartProduct && action == "increase") {
      existingCartProduct.quantity += 1;
      await existingCartProduct.save();
      return res.status(200).json({
        message: "Product quantity updated in the cart",
        cartProduct: existingCartProduct,
      });
    } else if (existingCartProduct && action == "decrease") {
      existingCartProduct.quantity -= 1;
      if (existingCartProduct.quantity == 0) {
        await Cart.deleteOne({ userId, productId });
        return res.status(200).json({ message: "Product removed from cart" });
      }
      await existingCartProduct.save();
      return res.status(200).json({
        message: "Product quantity updated in the cart",
        cartProduct: existingCartProduct,
      });
    }

    const newCartProduct = new Cart({
      userId,
      productId,
      quantity: 1,
    });

    await newCartProduct.save();

    return res.status(201).json({
      message: "Product added to the cart",
      cartProduct: newCartProduct,
    });
  } catch (error) {
    console.log(error, "updateProductToCart", "1");

    return res
      .status(500)
      .json({ message: "Error adding product to cart", error });
  }
};

export const getCartProducts = async (req, res) => {
  try {
    const userId = req.user.id;

    const cartProducts = await Cart.find({ userId }).populate("productId");

    if (!cartProducts || cartProducts.length === 0) {
      return res.status(404).json({ message: "No products found in the cart" });
    }

    return res.status(200).json(cartProducts);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching cart products", error });
  }
};

export const deleteCartProduct = async (req, res) => {
  try {
    const userId = req.user.id; 
    const productId = req.params.id; 

    const result = await Cart.findOneAndDelete({ userId, productId });

    if (!result) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    return res.status(200).json({ message: "Product removed from cart" });
  } catch (error) {
    return res.status(500).json({ message: "Error removing product from cart", error });
  }
};
