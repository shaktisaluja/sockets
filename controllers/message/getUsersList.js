const createError = require("http-errors");
const { ObjectId } = require("mongoose").Types;

// import user model
const User = require("../../models/User.model");
const convertParams = require("../../helpers/convertParams");

const getUsersList = async (req, res, next) => {
  try {
    const { query } = req;
    const { _id: userId } = req.user.data;
    const filters = convertParams(User, query);
    const startIndex = (query._start && parseInt(query._start)) || 0;
    const viewSize = (query._limit && parseInt(query._limit)) || 10;
    const searchCriteria = { ...filters.where, ...filters.find };
    const response = await User.aggregate([
      { $match: searchCriteria },
      {
        $match: {
          $expr: {
            $or: [
              { $in: [ObjectId(userId), "$followers"] },
              { $in: [ObjectId(userId), "$following"] },
            ],
          },
        },
      },
      {
        $facet: {
            users: [
                {
                    $skip: startIndex,
                },
                {
                    $limit: parseInt(viewSize),
                },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        avatar_url: 1,
                        user_handle: 1,
                    },
                },
            ],
            count: [
                {
                    $count: "count",
                },
            ],
        },
        }
    ]);
    if (!response)
      throw createError.InternalServerError("User details can not be fetched");

    res.status(200).json({
      message: "success",
      data: response[0] ? {
        users: response[0]?.users || [],
        count: response[0]?.users?.length || 0,
        user_total: response[0]?.count[0]?.count || 0,
      } : { users: [], count: 0, user_total: 0 },
    //   data: response
    });
  } catch (error) {
    console.log("error: ", error);
    next(error);
  }
};

module.exports = getUsersList;
