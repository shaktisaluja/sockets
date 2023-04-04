const validPaymentMethodService = require("../../services/validatePaymentMethod.js");

const validatePaymentMethod = async (req, res, next) => {
  try {
    const success = await validPaymentMethodService(req.body);
    if (success) {
      //respond with the client secret and intent id of the new payment intent
      res.json(success);
    }
  } catch (error) {
    console.log("error occurred while validating payment method: ", error);
    next(error);
  }
};

module.exports = validatePaymentMethod;
