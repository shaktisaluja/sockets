const createError = require("http-errors");
const stripe = require("../../utils/stripe");
const StripeProduct = require("../../models/StripeProduct.model");
const User = require("../../models/User.model");

const addSubscription = async (req, res, next) => {
  try {
    const { _id: userId, name: userName } = req.user.data;
    const { price } = req.body;
    const existingProduct = await StripeProduct.findOne({
      user_id: userId,
    });
    if (existingProduct)
      throw createError.Conflict("Subscription already exists for the user");
    else {
      const product = await stripe.products.create({
        name: userId,
        metadata: {
          userName,
          userId,
        },
      });
      const product_record = await stripe.products.retrieve(product.id);
      const priceDetails = await stripe.prices.create({
        unit_amount: price * 100,
        currency: "usd",
        recurring: { interval: "month" },
        product: product_record?.id,
        metadata: {
          userId,
          userName,
        },
      });
      const price_record = await stripe.prices.retrieve(priceDetails.id);
      const finalDetails = await StripeProduct.create({
        user_id: userId,
        product_id: price_record?.product,
        price_id: price_record?.id,
      });
      if (finalDetails) {
        const user = await User.findOneAndUpdate(
          { _id: userId },
          {
            $set: {
              subscription_price: price * 100,
              subscription_active: true,
            },
          },
          { new: true }
        );
        return res.json({
          message: "success",
          product: finalDetails,
          price: price,
          subscription_active: user?.subscription_active,
        });
      }
      res.json({
        message: "success",
        product: finalDetails,
        price: price * 100,
      });
    }
  } catch (error) {
    console.log("error in creating stripe product: ", error);
    next(error);
  }
};

module.exports = addSubscription;
