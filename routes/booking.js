const express = require("express");
const {
  createBooking,
  getBookings,
  getAllBookings
} = require("../controllers/booking");

const {validateToken, verifyTokenAndAuthorization, verifyTokenAndAdmin} = require("../middleware/validateTokenHandler")


const router = express.Router();

router.post("/rideHailing", verifyTokenAndAuthorization, createBooking); 

router.get("/", verifyTokenAndAuthorization, getBookings);

router.get("/all", verifyTokenAndAdmin, getAllBookings);

module.exports = router;
