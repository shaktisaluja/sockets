const Notification = require("../../models/Notification.model");
const { newNotificationValidation } = require("../validation_schema");

/**
 *  Save a single notification record
 * @param {String} actor - user id of the notification generator
 * @param {String} verb - notification classifier
 * @param {String} object - actual notification data
 * @param {String} receiver - user id who is expected to receive the notification
 */
const saveNotification = async ({ actor, verb, object, receiver }) => {
  try {
    await newNotificationValidation.validateAsync({
      actor,
      verb,
      object,
      receiver,
    });
    const notification = new Notification({
      actor,
      verb,
      object,
      receiver,
    });
    await notification.save();
    return notification;
  } catch (err) {
    console.log("err in save notification: ", err);
    return err;
  }
};

module.exports = saveNotification;
