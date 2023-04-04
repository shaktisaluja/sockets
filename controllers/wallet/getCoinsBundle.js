const keys = require("../../config/keys").coins;
const getCoinsBundle = async (req, res, next) => {
  try {
    const coinsBundles = keys.bundles.map((item) => ({
      id: item.id,
      amount: item.amount,
      cost: item.amount * keys.buyPrice,
    }));
    res.status(200).json({
      message: "success",
      data: coinsBundles,
    });
  } catch (error) {
    console.log("error: ", error);
    next(error);
  }
};

module.exports = getCoinsBundle;
