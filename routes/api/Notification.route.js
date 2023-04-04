const router = require("express").Router();

// bring in models and controllers
const getNotificationSeting = require("../../controllers/notification/getNotificationSetting");
const updateNotification= require("../../controllers/notification/updateNotificationSetting")
const markNotificationsRead = require("../../controllers/notification/markNotificationsRead");

// fetch list of notifications
//router.get("/", getNotifications);


router.put("",updateNotification)

//get notification preference
router.get("/:id",getNotificationSeting)

// mark all notifications as read
router.post("/read", markNotificationsRead);

module.exports = router;
