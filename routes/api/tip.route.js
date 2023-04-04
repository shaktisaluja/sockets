const router = require("express").Router();

// bring in models and controllers
const sendTip = require("../../controllers/tip/sendTip");

// send tip
router.post("/", sendTip);

module.exports = router;
