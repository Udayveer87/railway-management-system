const Booking = require("../models/Booking");
const Train = require("../models/Train");

// 1. CREATE: Book tickets
const createBooking = async (req, res) => {
  try {
    const { userId, trainId, date, passengers } = req.body;

    // Check if the train exists
    const train = await Train.findById(trainId);
    if (!train) {
      return res.status(404).json({ message: "Train not found" });
    }

    // Simplistic check for available seats
    if (train.availableSeats < passengers.length) {
      return res.status(400).json({ message: "Not enough seats available" });
    }

    // Create the booking in the database
    const booking = await Booking.create({
      userId,
      trainId,
      date: new Date(date),
      passengers,
      totalPassengers: passengers.length,
      bookingStatus: "confirmed",
    });

    // Update the train's available seats capacity
    await Train.findByIdAndUpdate(trainId, {
      $inc: { availableSeats: -passengers.length, bookingCount: 1 }
    });

    return res.status(201).json({ message: "Booking created successfully", booking });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 2. READ: Get all bookings (with optional simple filtering)
const getBookings = async (req, res) => {
  try {
    // We pass req.query straight to find() to allow basic filtering (e.g., ?userId=123)
    const filter = req.query || {};

    // Retrieve bookings and populate related User and Train documents
    const bookings = await Booking.find(filter)
      .populate("trainId", "name number source destination")
      .populate("userId", "name email");

    return res.status(200).json({ count: bookings.length, bookings });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 3. UPDATE: Cancel an entire booking
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    // Direct update query to mark the booking as cancelled
    const booking = await Booking.findByIdAndUpdate(
      id,
      { bookingStatus: "cancelled" },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Refund the available seats to the Train
    await Train.findByIdAndUpdate(booking.trainId, {
      $inc: { availableSeats: booking.totalPassengers }
    });

    // Note: To keep the demo simple, we do not individually update each passenger's status here
    return res.status(200).json({ message: "Booking cancelled", booking });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 4. UPDATE: Add passengers to an existing booking
const addPassengers = async (req, res) => {
  try {
    const { id } = req.params;
    const { passengers } = req.body; // Expecting an array of passengers

    // Use $push with $each to add multiple sub-documents in one go
    const booking = await Booking.findByIdAndUpdate(
      id,
      {
        $push: { passengers: { $each: passengers } },
        $inc: { totalPassengers: passengers.length }
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Also deduct the seats from Train availability
    await Train.findByIdAndUpdate(booking.trainId, {
      $inc: { availableSeats: -passengers.length }
    });

    return res.status(200).json({ message: "Passengers added", booking });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 5. DELETE (Update): Remove a passenger securely from the array
const removePassenger = async (req, res) => {
  try {
    const { id } = req.params;
    const { seatNumber } = req.body;

    // Use $pull to remove a specific item from an array
    const booking = await Booking.findByIdAndUpdate(
      id,
      {
        $pull: { passengers: { seatNumber: seatNumber } },
        $inc: { totalPassengers: -1 }
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Increase available train seats since a passenger left
    await Train.findByIdAndUpdate(booking.trainId, {
      $inc: { availableSeats: 1 }
    });

    return res.status(200).json({ message: "Passenger removed", booking });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 6. UPDATE: Mark a specific passenger as cancelled
const cancelPassenger = async (req, res) => {
  try {
    const { id, seatNumber } = req.params;

    // Use array filters / positional operator to target specific array element
    const booking = await Booking.findOneAndUpdate(
      { _id: id, "passengers.seatNumber": seatNumber },
      { $set: { "passengers.$.status": "cancelled" } },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking or passenger not found" });
    }

    // Increase available train seats by 1
    await Train.findByIdAndUpdate(booking.trainId, {
      $inc: { availableSeats: 1 }
    });

    return res.status(200).json({ message: "Passenger cancelled", booking });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  getBookings,
  cancelBooking,
  addPassengers,
  removePassenger,
  cancelPassenger,
};
