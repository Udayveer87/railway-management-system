const { getAllIndexes } = require("../config/indexSetup");

const getIndexesInfo = async (_req, res) => {
  try {
    const indexes = await getAllIndexes();
    return res.status(200).json(indexes);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getIndexesInfo,
};
