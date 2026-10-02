const express = require("express");
const {
  createBooking,
  getBookings,
  cancelBooking,
  addPassengers,
  removePassenger,
  cancelPassenger,
} = require("../controllers/bookingController");

const router = express.Router();

router.post("/", createBooking);
router.get("/", getBookings);
router.patch("/:id/cancel", cancelBooking);
router.patch("/:id/passengers", addPassengers);
router.patch("/:id/remove-passenger", removePassenger);
router.patch("/:id/passengers/:seatNumber/cancel", cancelPassenger);

module.exports = router;
