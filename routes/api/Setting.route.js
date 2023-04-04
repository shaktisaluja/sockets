const router = require("express").Router();

const getBlockedUser = require("../../controllers/userSettings/blockedUser");
const getUser = require("../../controllers/userSettings/getUserInfo");
const unBlockUser = require("../../controllers/userSettings/unBlockUser");



//get blocked User
router.get("/block", getBlockedUser);

//get User Information
router.get("/userInfo", getUser);

//Unblock User
router.delete("/user/:id/unblock", unBlockUser );


module.exports = router;