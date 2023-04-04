const router = require("express").Router();

// bring in models and controllers
const getGiftsData = require("../../controllers/dashboard/getGiftsData");
const getGiftsOverViewData = require("../../controllers/dashboard/getGiftsOverViewData");
const getOverviewData = require("../../controllers/dashboard/getOverviewData");
const getPostsOverViewData = require("../../controllers/dashboard/getPostsOverViewData");
const getTipsOverViewData = require("../../controllers/dashboard/getTipsOverViewData");
const getChatsOverViewData = require("../../controllers/dashboard/getChatsOverViewData");

// get dashboard details
router.get("/stats", getOverviewData);
router.get("/stats/tips", getTipsOverViewData);
router.get("/stats/gifts", getGiftsOverViewData);
router.get("/stats/posts", getPostsOverViewData);
router.get("/stats/chats", getChatsOverViewData);

router.get("/gifts", getGiftsData);

module.exports = router;
