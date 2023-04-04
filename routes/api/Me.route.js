const router = require("express").Router();

// bring in models and controllers
const getUser = require("../../controllers/me/getUser");
const updateUser = require("../../controllers/me/updateUser");
const getUserPosts = require("../../controllers/me/getUserPosts");
const updateAvatar = require("../../controllers/me/updateAvatar");
const uploadCover = require("../../controllers/me/uploadCover");
//const currentUser = require("../../controllers/user/currentUser")
const deleteAvatar = require("../../controllers/me/deleteAvatar");
const deleteCover = require("../../controllers/me/deleteCover");
const handleExists = require("../../controllers/me/handleExists");
const updatePrivacy = require("../../controllers/me/updatePrivacy");
const {
  getMyPendingFollowRequestersList,
  getMyPendingFollowRequestsList,
  getUserStats,
} = require("../../controllers/user/followers/get");
const updateFollowRequestStatus = require("../../controllers/user/followers/update");
const getFollowings = require("../../controllers/me/getFollowings");
const getFollowers = require("../../controllers/me/getFollowers");
const getSubscribers = require("../../controllers/me/getSubscribers");
const getSubscriptions = require("../../controllers/me/getSubscriptions");

// get user details
router.get("/", getUser);

// update user details
router.put("/", updateUser);

// register a user
router.get("/posts", getUserPosts);

// post profile picture
router.post("/avatar", updateAvatar);

// post profile picture
router.post("/cover", uploadCover);

// post profile picture
router.post("/privacy", updatePrivacy);

// post profile picture
router.delete("/avatar", deleteAvatar);

// post profile picture
router.delete("/cover", deleteCover);

// check user handle already existence
router.post("/exists", handleExists);

// get current user followers
router.get("/:id/followers", getFollowers);

// get current user followings
router.get("/followings", getFollowings);

// get current user subscribers
router.get("/subscribers", getSubscribers);

// get current user subscriptions
router.get("/subscriptions", getSubscriptions);

// update user's pending followers
router.get("/followers/pending", getMyPendingFollowRequestersList);

// update user's pending followers
router.get("/followers/requests", getMyPendingFollowRequestsList);

// get stats
router.get("/stats", getUserStats);

// update follow request status, either accepted or rejected in case of user having private account
router.patch("/follow/:id", updateFollowRequestStatus);

module.exports = router;
