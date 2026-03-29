import UserModel from "../models/User.js";

export const getRandomUsers = async (req, res) => {
  try {
    console.log(" FEED API HIT");

    const totalCount = await UserModel.countDocuments({
      profilePicture: { $exists: true, $ne: null },
    });

    if (totalCount === 0) {
      return res.status(200).json([]);
    }

    const sampleSize = 5;
    const users = [];

    const getRandomInRange = (min, max) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    for (let i = 0; i < sampleSize; i++) {
      let region = i % 3;
      let randomIndex;

      if (region === 0) {
        randomIndex = getRandomInRange(0, Math.floor(totalCount * 0.1));
      } else if (region === 1) {
        const start = Math.floor(totalCount * 0.45);
        const end = Math.floor(totalCount * 0.55);
        randomIndex = getRandomInRange(start, end);
      } else {
        const start = Math.floor(totalCount * 0.9);
        const end = totalCount - 1;
        randomIndex = getRandomInRange(start, end);
      }

      const randomUser = await UserModel.findOne({
        profilePicture: { $exists: true, $ne: null },
      })
        .skip(randomIndex)
        .select(
          "-password -__v -coins -blacklist -couponCodesUsed -couponCodePercentRemission"
        );

      if (randomUser) {
        const alreadyExists = users.find((u) =>
          u._id.equals(randomUser._id)
        );

        if (!alreadyExists) {
          users.push(randomUser);
        }
      }
    }

    return res.status(200).json(users);
  } catch (error) {
    console.error(" FEED ERROR:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};