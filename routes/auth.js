const express = require("express");
const {
  registerUser,
  loginUser,
  resetPassword
} = require("../controllers/auth");

const { decodeAccessToken } = require("../helpers/decodeAccessToken");

const {validateToken, verifyTokenAndAuthorization, verifyTokenAndAuthorizationQuery} = require("../middleware/validateTokenHandler")

const router = express.Router();

router.post("/registerUser", registerUser);

router.post("/loginUser", loginUser);

router.put("/resetpassword",verifyTokenAndAuthorizationQuery, resetPassword);

router.post("/decode", decodeAccessToken);

module.exports = router;
