const stripe = require("../../utils/stripe");
const { paymentTypeValidation } = require("../../services/validation_schema");

const generatePayment = async (req, res, next) => {
  try {
    // const { _id: userId } = req.user.data;
    //user sends price along with request
    //get stripe payment id from token
    const { stripe_customer_id } = req.user.data;
    await paymentTypeValidation.validateAsync({
      type: req.body.type,
      price: req.body.price,
    });
    const userPrice = parseInt(req.body.price) * 100;

    //create a payment intent
    const intent = await stripe.paymentIntents.create({
      //use the specified price
      amount: userPrice,
      currency: "usd",
      payment_method_types: ["card"],
      customer: stripe_customer_id,
      setup_future_usage: "off_session",
    });

    //respond with the client secret and id of the new payment intent
    res.json({ client_secret: intent.client_secret, intent_id: intent.id });
  } catch (error) {
    console.log("error: ", error);
    next(error);
  }
};

module.exports = generatePayment;
