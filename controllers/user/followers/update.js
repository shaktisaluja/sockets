const createError = require("http-errors");

// import verify token model and user model
const UserFollow = require("../../../models/UserFollow.model");
const User = require("../../../models/User.model");
const {
  createFollowRequestUpdateValidation,
} = require("../../../services/validation_schema");
const followAcceptedNotification = require("../../../services/notifications/follow/followAcceptedNotification");
const Notification = require("../../../models/Notification.model");
const updateFollowRequestStatus = async (req, res, next) => {
  try {
    const { _id: userId } = req.user.data;
    const { id } = req.params;
    if (!id) throw createError.BadRequest("User id not found!");

    const loggedInUser = await User.findOne({
      _id: userId,
      followers: { $in: [id] },
    });

    if (loggedInUser && loggedInUser?._id)
      throw createError.BadRequest("This user is already following you!");

    const { status } = await createFollowRequestUpdateValidation.validateAsync(
      req.body
    );

    const response = await UserFollow.findOneAndUpdate(
      { to: userId, from: id },
      { status },
      { new: true }
    );
    if (status === "accepted") {
      await User.findOneAndUpdate(
        { _id: userId },
        { $addToSet: { followers: id } },
        { new: true }
      );
      await User.findOneAndUpdate(
        { _id: id },
        { $addToSet: { following: userId } }
      );
      followAcceptedNotification(userId, id, req.io);
    }
    if (status === "rejected") {
      await UserFollow.findOneAndDelete({ to: userId, from: id });
    }
    await Notification.findOneAndDelete({
      actor: id,
      receiver: userId,
      verb: "follow-request",
    });
    res.status(200).json({
      message: "success",
      data: response,
    });
  } catch (error) {
    console.log("error: ", error);
    next(error);
  }
};

module.exports = updateFollowRequestStatus;
