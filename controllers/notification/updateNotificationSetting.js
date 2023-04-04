const NotificationSetting = require("../../models/NotificationSetting.model");
const { ObjectId } = require("mongoose").Types;
const User = require("../../models/User.model");
const updateNotification = async (req, res, next) => {
  const { _id: userId } = req.user.data;
  try {
    const { notifications } = req.body;
    const updatePosts = await NotificationSetting.findOneAndUpdate(
      { userId: ObjectId(userId) },
      {
        notifications,
      },
      { new: true }
    );
    await updatePosts.save();
    res.json({ message: "success", data: updatePosts });
  } catch (error) {
    next(error);
  }
};
module.exports = updateNotification;