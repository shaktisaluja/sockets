const router = require("express").Router();

// bring in models and controllers
const validateAccessToken = require("../../middlewares/jwt_validation");
const getUser = require("../../controllers/user/getAnyUser");
//const getUsersList = require("../../controllers/user/getUsersList");
const getUsersList = require("../../controllers/user/getUsersList");
const getUserPosts = require("../../controllers/user/getUserPosts");
//const getUser = require("../../controllers/user/currentUser")
const upoadCoverPhoto = require("../../controllers/user/upoadCoverPhoto");
// const subscribeToUser = require("../../controllers/subscription/new");
const addAsFollowing = require("../../controllers/user/followers/add");
const blockUser = require("../../controllers/user/blockUser");
const unblockUser = require("../../controllers/user/unblockUser");
const  {getFollowers}  = require("../../controllers/user/followers/get");
const  getFollowing  = require("../../controllers/user/followers/getFollowing");
const removeAsFollowing = require("../../controllers/user/followers/remove");
const cancelFollowRequest = require("../../controllers/user/followers/cancelRequest");
const addSubscriber = require("../../controllers/user/subscriptions/newSubscription");
const removeSubscriber = require("../../controllers/user/subscriptions/cancelSubscription");
const uploadAvatar = require("../../controllers/user/uploadAvatar");
const updateUser = require("../../controllers/user/updateUser");


// get user details
router.get("/:id", validateAccessToken, getUser);

// get users list
router.get("/", validateAccessToken, getUsersList);

// get user posts
router.get("/:id/posts", validateAccessToken, getUserPosts);

//get  User
router.get('/:id',getUser)

//block user
router.post("/:id/block", validateAccessToken , blockUser)

router.delete("/:id/unblock", validateAccessToken , unblockUser)

// get user awards
//router.get("/:id/awards", validateAccessToken, getUserAwards);

// subscribe to user
// router.post("/:id/subscribe", validateAccessToken, subscribeToUser);

// follow :id user
router.post("/:id/follow", validateAccessToken, addAsFollowing);

// UploadAvatar on user Account
router.put("/uploadAvatar", validateAccessToken, uploadAvatar);

// UploadAvatar on user Account
router.put("/uploadCoverPhoto", validateAccessToken, upoadCoverPhoto);

// Update User by its UserId
router.put("", validateAccessToken, updateUser);

// remove :id user as a follower
router.delete("/:id/unfollow", validateAccessToken, removeAsFollowing);

// cancel :id user follow request
router.delete("/:id/follow/cancel", validateAccessToken, cancelFollowRequest);

// get followers
router.get("/:id/following", validateAccessToken, getFollowing);

// get following
router.get("/:id/followers", validateAccessToken, getFollowers);

// subscribe user
router.post("/:id/subscribe", validateAccessToken, addSubscriber);

// unsubscribe user
router.delete("/:id/subscribe", validateAccessToken, removeSubscriber);

module.exports = router;
