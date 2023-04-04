const router = require("express").Router();

const addFolder = require("../../controllers/folder/addFolder");
const addPostInFolder = require("../../controllers/folder/addPostInFolder");
const getPostsFromFolder = require("../../controllers/folder/getPostFromFolder");
const getFolder = require("../../controllers/folder/getFolder");


// create a folder for adding posts
router.post("", addFolder);

// add post in created Folder
router.post("/:id/post/:postId", addPostInFolder);

// get posts in created Folder
router.get("/:id", getPostsFromFolder);

// get Folders list
router.get("/", getFolder);


module.exports = router;