import UserModel from "../models/User.js";

//  Helper
const getRandomUsers = async (pipeline) => {
  return await UserModel.aggregate([
    ...pipeline,
    { $sample: { size: 10 } },
  ]);
};

// ==========================
// FILTER USERS
// ==========================
export const filterUsers = async (req, res) => {
  try {
    console.log("FILTER API HIT");

    const {
      type,
      relationTime,
      country,
      state,
      interests,
      minHeight,
      maxHeight,
    } = req.query;

    let pipeline = [];

    switch (type) {
      case "relationship-time":
        pipeline.push({
          $match: { relationTime },
        });
        break;

      case "location":
        pipeline.push({
          $match: {
            "location.country": country,
            "location.state": state,
          },
        });
        break;

      case "interests":
        pipeline.push({
          $match: {
            interests: { $in: interests?.split(",") || [] },
          },
        });
        break;

      case "height-range":
        pipeline.push(
          //  Convert string → number
          {
            $addFields: {
              heightNum: { $toInt: "$height" },
            },
          },
          {
            $match: {
              heightNum: {
                $gte: Number(minHeight),
                $lte: Number(maxHeight),
              },
            },
          }
        );
        break;

      default:
        return res.status(400).json({
          message: "Invalid filter type",
        });
    }

    //  Exclude current user
    pipeline.push({
      $match: {
        _id: { $ne: req.userId },
      },
    });

    const users = await getRandomUsers(pipeline);

    res.status(200).json({
      count: users.length,
      users,
    });

  } catch (error) {
    console.error("FILTER ERROR:", error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};