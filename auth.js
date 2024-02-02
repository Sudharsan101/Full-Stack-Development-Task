const express = require("express");
const userController = require("../controllers/users");
const router = express.Router();

router.post("/signup",userController.signup);
router.get("/auth/logout",userController.logout);
module.exports = router;