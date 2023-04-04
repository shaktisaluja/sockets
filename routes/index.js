const router = require("express").Router();
const createError = require("http-errors");
const Notification = require("../models/Notification.model");

const apiRoutes = require("./api");

router.use("/api", apiRoutes);

// router.use("/api", (req, res, next) => {
//   next(
//     createError.NotFound("The route you are trying to access does not exist.")
//   );
// });

router.post("/delete-notification", async (req, res) => {
  await Notification.deleteMany({ actor: "6195d2daad9b473360e0f691" });
  res.send("success");
});

// eslint-disable-next-line no-unused-vars
router.use((error, req, res, next) => {
  res.status(error.status || 500);
  return res.json({
    error: {
      status: error.status || 500,
      message: error.message || "Internal Server Error",
    },
  });
});

module.exports = router;
