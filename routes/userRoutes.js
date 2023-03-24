const express = require("express");
const {
  registerUser,
  loginUser,
  userProfile
} = require("../controllers/userController");

const validateToken = require("../middleware/validateTokenHandler")


const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/profile", validateToken, userProfile);

module.exports = router;
