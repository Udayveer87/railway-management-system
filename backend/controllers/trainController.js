const Train = require("../models/Train");

// CREATE: Add a new train (Admin only typically, but we keep it simple here)
const addTrain = async (req, res) => {
  try {
    const {
      name,
      number,
      source,
      destination,
      stations,
      runsOn,
      classes,
      totalSeats
    } = req.body;

    const train = await Train.create({
      name,
      number,
      source,
      destination,
      stations: Array.isArray(stations) ? stations : [],
      runsOn: Array.isArray(runsOn) ? runsOn : [],
      classes: Array.isArray(classes) ? classes : [],
      totalSeats: Number(totalSeats),
      availableSeats: Number(totalSeats), // initialize to full capacity
    });

    return res.status(201).json({ message: "Train added successfully", train });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// READ: Search for trains
const getTrains = async (req, res) => {
  try {
    const { source, destination, keyword } = req.query;
    
    let filter = {};

    // 1. Basic equality check
    if (source && destination) {
      filter = { source: source, destination: destination };
    } 
    // 2. Simple regex search demo for finding trains by keywords (source, destination or name)
    else if (keyword) {
      const regex = new RegExp(keyword, "i");
      filter = {
        $or: [{ name: regex }, { source: regex }, { destination: regex }]
      };
    }

    // Retrieve the trains matching the filter
    const trains = await Train.find(filter);

    return res.status(200).json({ count: trains.length, trains });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addTrain,
  getTrains,
};
