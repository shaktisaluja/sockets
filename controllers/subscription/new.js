const createError = require("http-errors");

// import verify token model and user model
const Subscription = require("../../models/Subscription.model");

const { createPostValidation } = require("../../services/validation_schema");
const subscriberAddedNotification = require("../../services/notifications/subscription/subscriberAddedNotification");

const subscribeToUser = async (req, res, next) => {
  try {
    const { _id: userId } = req.user.data;
    const { id } = req.params;

    const subscription = await Subscription.findOne({
      subscription_to: id,
      subscription_from: userId,
    });
    if (subscription) {
      throw createError.Conflict("You are already subscribed to this user");
    }
    const newSub = new Subscription({
      subscription_to: id,
      subscription_from: userId,
    });
    const subResponse = await newSub.save();
    res.status(200).json({
      message: "success",
      data: subResponse,
    });
    subscriberAddedNotification(userId, id, subResponse._id, req.io);
  } catch (error) {
    console.log("error: ", error);
    next(error);
  }
};

module.exports = subscribeToUser;
