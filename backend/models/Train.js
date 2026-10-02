const mongoose = require("mongoose");

const trainSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  number: {
    type: String,
    required: true,
    trim: true,
  },
  source: {
    type: String,
    required: true,
    trim: true,
  },
  destination: {
    type: String,
    required: true,
    trim: true,
  },
  stations: {
    type: [String],
    default: [],
  },
  runsOn: {
    type: [String],
    default: [],
  },
  classes: {
    type: [String],
    default: [],
  },
  totalSeats: {
    type: Number,
    required: true,
    min: 0,
  },
  availableSeats: {
    type: Number,
    min: 0,
  },
  bookingCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

trainSchema.pre("validate", function setSeatDefaults(next) {
  if (this.availableSeats === undefined || this.availableSeats === null) {
    this.availableSeats = this.totalSeats;
  }

  if (this.availableSeats > this.totalSeats) {
    this.availableSeats = this.totalSeats;
  }

  next();
});

trainSchema.index({ source: 1, destination: 1 });
trainSchema.index({ stations: 1 });
trainSchema.index({ runsOn: 1 });
trainSchema.index({ classes: 1 });

module.exports = mongoose.model("Train", trainSchema);
