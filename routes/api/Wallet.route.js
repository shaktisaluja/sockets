const router = require("express").Router();

const Wallet = require("../../models/Wallet.model");

// bring in models and controllers
const addCoins = require("../../controllers/wallet/addCoins");
const getCoinsBundle = require("../../controllers/wallet/getCoinsBundle");

// add coins to wallet
router.post("/coin", addCoins);

// add coins to wallet
router.post("/new", async (req, res, next) => {
  const { _id: userId } = req.user.data;
  const wallet = new Wallet({
    user: userId,
    coins: 10000,
  });
  await wallet.save();
  res.status(200).json({
    message: "success",
  });
});

// increment coins to wallet
router.post("/coins", async (req, res, next) => {
  const { _id: userId } = req.user.data;

  const updatedWallet = Wallet.findOneAndUpdate(
    { user: userId },
    { coins: 200 }
  );
  res.status(200).json({
    message: "success",
  });
});

// get coins bundle
router.get("/coins", getCoinsBundle);

module.exports = router;
