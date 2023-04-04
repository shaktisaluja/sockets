const router = require("express").Router();

// bring in models and controllers
const getProductChangeAudit = require("../../controllers/product/getProductChangeAudit");
const updateCreatorProduct = require("../../controllers/product/updateCreatorProduct");
const getMyProducts = require("../../controllers/product/getMyProducts");

// get dashboard details
router.get("/me/product-change/audit", getProductChangeAudit);

// get dashboard details
router.put("/me/product/:productId", updateCreatorProduct);

// get my products
router.get("/me/products", getMyProducts);

module.exports = router;
