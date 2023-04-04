// const createError = require("http-errors");
const _ = require("lodash");
// import verify token model and user model
const User = require("../../models/User.model");
const UserFollow = require("../../models/UserFollow.model");
const followAcceptedNotification = require("../../services/notifications/follow/followAcceptedNotification");
const {
  updateUserPrivacyValidation,
} = require("../../services/validation_schema");

const updatePrivacy = async (req, res, next) => {
  try {
    const { _id: userId } = req.user.data;
    const { is_private } = await updateUserPrivacyValidation.validateAsync(
      req.body
    );
    if (!is_private) {
      const pendingRequests = await UserFollow.find(
        { to: userId, status: "pending" },
        { from: 1 }
      );
      const pendingFollowers = _.map(pendingRequests, "from");
      await UserFollow.updateMany(
        { to: userId, status: "pending" },
        { status: "accepted" }
      );
      await User.findOneAndUpdate(
        { _id: userId },
        { is_private, $addToSet: { followers: { $each: pendingFollowers } } },
        { new: true }
      );
      pendingFollowers?.map((id) => {
        followAcceptedNotification(userId, id, req.io);
      });
    } else {
      await User.findOneAndUpdate(
        { _id: userId },
        { is_private },
        { new: true }
      );
    }

    return res.status(200).json({ message: "success" });
  } catch (error) {
    console.log("error: ", error);
    next(error);
  }
};

module.exports = updatePrivacy;
