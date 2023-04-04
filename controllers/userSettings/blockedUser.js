const BlockUser = require("../../models/blockUser.model");
const { ObjectId } = require("mongoose").Types;

const getBlockedUser = async (req, res, next) => {
    const { _id: userId } = req.user.data;
    try {

        const { query } = req;
        const currentPage = (query._Page && parseInt(query._Page)) || 1;
        const viewSize = (query.viewSize && parseInt(query.viewSize)) || 10;


        //Skipping documents according to pages 
        let skipDocuments = 0
        if (currentPage != 1) skipDocuments = (currentPage - 1) * viewSize;

        const response = await BlockUser.aggregate([
            { $sort: { created_at: -1 } },
            { $skip: skipDocuments },
            { $limit: parseInt(viewSize) },
            { $match: { blockedBy: ObjectId(userId) } },
            {
                $lookup: {
                    from: "user",
                    localField: "blockedUser",
                    foreignField: "_id",
                    as: "blockedUser"
                }
            },
            { $unwind: { path: "$blockedUser", preserveNullAndEmptyArrays: true } }, 
            { $unset: ["blockedUser.onBoarding", "blockedUser.followers_count", "blockedUser.following_count", "blockedUser.__v","blockedBy"] },


        ]);

        res.send({ status: true, message: response })

    } catch (error) {
        next(error);
    }
};

module.exports = getBlockedUser;


