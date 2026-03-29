import UserModel from "../models/User.js";

// ==========================
// LIKE USER / MATCH LOGIC
// ==========================
export const likeUser = async (req, res) => {
  try {
    console.log("LIKE USER API");

    const { likedUser } = req.body;

    if (!likedUser) {
      return res.status(400).json({
        message: "likedUser is required",
      });
    }

    //  current user (from authMiddleware)
    const currentUser = await UserModel.findById(req.userId);
    const otherUser = await UserModel.findOne({ username: likedUser });

    if (!currentUser || !otherUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // ==========================
    // ADD TO LIKE ARRAY
    // ==========================
    if (!currentUser.likeArray.includes(likedUser)) {
      currentUser.likeArray.push(likedUser);
      currentUser.likeCount += 1;
      await currentUser.save();
    }

    // ==========================
    // MATCH LOGIC
    // ==========================
    let isMatch = false;

    if (otherUser.likeArray.includes(currentUser.username)) {
      isMatch = true;

      // add to match arrays (both users)
      if (!currentUser.matchArray.includes(likedUser)) {
        currentUser.matchArray.push(likedUser);
      }

      if (!otherUser.matchArray.includes(currentUser.username)) {
        otherUser.matchArray.push(currentUser.username);
      }

      currentUser.numberOfMatches += 1;
      otherUser.numberOfMatches += 1;

      await currentUser.save();
      await otherUser.save();
    }

    return res.status(200).json({
      message: isMatch ? "Match found!" : "User liked successfully",
      match: isMatch,
    });

  } catch (error) {
    console.error("LIKE USER ERROR:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};