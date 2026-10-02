const Train = require("../models/Train");
const Booking = require("../models/Booking");

const ensureIndexes = async () => {
  // Explicit createIndex calls for class/demo visibility.
  await Train.collection.createIndex({ source: 1, destination: 1 });
  await Train.collection.createIndex({ stations: 1 });
  await Train.collection.createIndex({ runsOn: 1 });
  await Train.collection.createIndex({ classes: 1 });

  await Booking.collection.createIndex({ trainId: 1, date: 1 });
  await Booking.collection.createIndex({ userId: 1 });

  console.log("Required indexes are ensured");
};

const getAllIndexes = async () => {
  const trainIndexes = await Train.collection.getIndexes();
  const bookingIndexes = await Booking.collection.getIndexes();

  return {
    trainIndexes,
    bookingIndexes,
  };
};

module.exports = {
  ensureIndexes,
  getAllIndexes,
};
