const express = require("express");
const { userMiddleware, requireLogin } = require("../common-middleware");
const { addAddress, getAddress } = require("../controller/address");
const router = express.Router();

router.post("/user/address/create", requireLogin, userMiddleware, addAddress);
router.post("/user/getaddress", requireLogin, userMiddleware, getAddress);

module.exports = router;
