const express = require("express");
const {
  bookingHistory,
  processPayment,
  updateProfileByAdmin,
  deleteUser, 
  getUserProfile,
  updateProfileByUser,
  getAllUsers
} = require("../controllers/user");

const {validateToken, verifyTokenAndAuthorization, verifyTokenAndAdmin} = require("../middleware/validateTokenHandler")


const router = express.Router();


// router.get("/:id/bookings", verifyTokenAndAuthorization, bookingHistory);

router.post("/payment", verifyTokenAndAuthorization, processPayment);

router.get("/", verifyTokenAndAdmin, getUserProfile);

router.get("/all", verifyTokenAndAdmin, getAllUsers);

router.put("/adminupdate", verifyTokenAndAdmin, updateProfileByAdmin);

router.put("/update", verifyTokenAndAuthorization, updateProfileByUser);

router.delete("/delete/:id", verifyTokenAndAdmin, deleteUser);

module.exports = router;
