const router = require("express").Router();

// bring in models and controllers
const addGift = require("../../controllers/gift/addGift");
const getGifts = require("../../controllers/gift/getGifts");
const postGift = require("../../controllers/gift/postGift");

// create gift
router.post("/", addGift);

// get gifts
router.get("/", getGifts);

// post gifts
router.post("/:postId", postGift);

module.exports = router;
