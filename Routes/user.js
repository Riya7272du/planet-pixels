const express = require("express");
const authController = require("./../Controllers/authController");
const router = express.Router();

router.get("/signup", (req, res) => {
  res.render("signup");
});

router.get("/signin", (req, res) => {
  res.render("signin");
});


router.post("/signup", authController.signup);
router.post("/signin", authController.login);

module.exports = router;
