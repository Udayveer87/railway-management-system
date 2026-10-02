const express = require("express");
const { getIndexesInfo } = require("../controllers/analyticsController");

const router = express.Router();

router.get("/indexes", getIndexesInfo);

module.exports = router;
