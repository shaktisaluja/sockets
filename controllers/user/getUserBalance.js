const Wallet = require("../../models/Wallet.model");

const getUserBalance = async (userId) => {
  // get total coins....
  const coinInWallet = await Wallet.findOne({
    user: userId,
  });
  const totalCoins = coinInWallet ? coinInWallet.coins : 0;
  const totalMoney = coinInWallet ? coinInWallet.money / 100 : 0;

  // return moneyFromStripe[0].sum /100;
  return { totalCoins, totalMoney };
};
module.exports = getUserBalance;
