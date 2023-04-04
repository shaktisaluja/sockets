const router = require("express").Router();

// bring in controllers
const getFeed = require("../../controllers/post/getFeed");
const getHighlightsFeed = require("../../controllers/post/getHighlightsFeed");

// get feed
router.get("/", getFeed);

// get highlights feed
router.get("/highlights", getHighlightsFeed);

module.exports = router;
