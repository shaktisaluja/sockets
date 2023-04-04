const Gift = require("../../models/Gift.model");

const getGifts = async (req, res, next) => {
  try {
    const { query } = req;
    const startIndex = (query._start && parseInt(query._start)) || 0;
    const viewSize = (query._limit && parseInt(query._limit)) || 10;

    const gifts = await Gift.aggregate([
      { $sort: { created_at: -1 } },
      { $skip: startIndex },
      { $limit: parseInt(viewSize) },
    ]);
    const count = await Gift.countDocuments();
    res.json({
      message: "success",
      data: {
        gifts,
        count: gifts?.length,
        total_count: count,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = getGifts;
