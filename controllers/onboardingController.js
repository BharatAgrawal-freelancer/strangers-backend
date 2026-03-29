import UserModel from "../models/User.js";
import cloudinary from "../config/cloudinary.js";

export const onboarding = async (req, res) => {
  try {
    console.log(" ONBOARDING API HIT");

    const userId = req.userId; // from authMiddleware

    //  Upload image to cloudinary (if exists)
    let profilePictureUrl = null;

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "strangers/profile" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(req.file.buffer);
      });

      profilePictureUrl = result.secure_url;
    }

    //  Extract fields
    const {
      username,
      name,
      gender,
      bio,
      hobbies,
      interests,
      work,
      education,
      universityOrSchool,
      personality,
      relationTime,
      height,
      weight
    } = req.body;

    //  Update user
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        username,
        name,
        gender,
        bio,
        hobbies: hobbies ? JSON.parse(hobbies) : [],
        interests: interests ? JSON.parse(interests) : [],
        work,
        education,
        universityOrSchool,
        personality,
        relationTime,
        height,
        weight,
        ...(profilePictureUrl && { profilePicture: profilePictureUrl })
      },
      { new: true, runValidators: true }
    ).select("-password -__v");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Onboarding completed",
      user: updatedUser,
    });

  } catch (error) {
    console.error(" ONBOARDING ERROR:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};