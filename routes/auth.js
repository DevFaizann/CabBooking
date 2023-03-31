const express = require("express");
const {
  registerUser,
  loginUser,
  resetPassword
} = require("../controllers/auth");

const {validateToken, verifyTokenAndAuthorization, verifyTokenAndAuthorizationQuery} = require("../middleware/validateTokenHandler")

const router = express.Router();

router.post("/registerUser", registerUser);

router.post("/loginUser", loginUser);

router.put("/resetpassword",verifyTokenAndAuthorizationQuery, resetPassword);


module.exports = router;
