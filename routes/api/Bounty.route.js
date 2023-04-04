const router = require("express").Router();

const createBounty = require("../../controllers/BountyProgram/createBounty");
const createdUserBounty = require("../../controllers/BountyProgram/createUserBounty");
const createBountyQuestion = require("../../controllers/bountyQuestion/createBountyQuestion")
const validateAccessToken = require("../../middlewares/jwt_validation");




// add post in created Folder

router.post("/create", createBounty);
router.post("/:id",createBountyQuestion)

//creating bounty for user
router.post("/create/user/bounty", validateAccessToken, createdUserBounty);






module.exports = router;    