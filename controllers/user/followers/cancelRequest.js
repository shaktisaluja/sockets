const createError = require("http-errors");
const Notification = require("../../../models/Notification.model");

// import verify token model and user model
const UserFollow = require("../../../models/UserFollow.model");

const cancelFollowRequest = async (req, res, next) => {
  const { _id: userId } = req.user.data;
  try {
    const followRecord = await UserFollow.findOne({
      to: req.params.id,
      from: userId,
      status: "pending",
    });
    if (!followRecord) {
      throw createError.BadRequest("You haven't sent a follow request");
    }
    await UserFollow.findOneAndDelete({
      to: req.params.id,
      from: userId,
      status: "pending",
    });
    await Notification.findOneAndDelete({
      actor: userId,
      receiver: req.params.id,
      verb: "follow-request",
    });
    res.json({ message: "success" });
  } catch (error) {
    next(error);
  }
};

module.exports = cancelFollowRequest;
