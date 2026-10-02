const express = require("express");
const { addTrain, getTrains } = require("../controllers/trainController");

const router = express.Router();

router.post("/", addTrain);
router.get("/", getTrains);

module.exports = router;
