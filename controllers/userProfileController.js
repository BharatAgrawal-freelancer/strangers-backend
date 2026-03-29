import UserModel from "../models/User.js";
import { uploadFromBuffer } from "../utils/cloudinaryHelper.js";

// Allowed fields
const editableFields = [
  "name", "profilePicture", "gender", "location", "bio", "hobbies",
  "interests", "work", "education", "universityOrSchool", "questions",
  "alcoholic", "smoking", "personality", "relationTime", "photos",
  "relationshipGoals", "familyPlan", "height", "weight",
  "subscriptions", "socialMediaLinks", "coins"
];

// Fields that come as JSON string from FormData
const jsonFields = [
  "hobbies",
  "interests",
  "photos",
  "subscriptions",
  "socialMediaLinks",
  "location",
  "questions"
];

// ==========================
// GET PROFILE
// ==========================
export const getUserProfile = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId).select(
      "-password -__v -oldMatches -superLikeCount -likeCount"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);

  } catch (error) {
    console.error("GET PROFILE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================
// PATCH PROFILE (FIXED)
// ==========================
export const updateUserProfile = async (req, res) => {
  try {

    const updates = {};

    // ==========================
    // HANDLE TEXT FIELDS
    // ==========================
    Object.keys(req.body).forEach((key) => {
      if (!editableFields.includes(key)) return;

      let value = req.body[key];

      // Parse JSON fields
      if (jsonFields.includes(key)) {
        try {
          value = JSON.parse(value);
        } catch (err) {
          console.warn(`Failed to parse ${key}, using fallback`);
        }
      }

      // Fix subscriptions
      if (key === "subscriptions") {
        if (!Array.isArray(value)) {
          value = [];
        }
      }

      updates[key] = value;
    });

    // ==========================
    // IMAGE UPLOAD (MULTIPLE)
    // ==========================

    // 🔹 PROFILE PICTURE (single)
    if (req.files?.profilePicture) {
      console.log("Uploading profile picture...");

      const file = req.files.profilePicture[0];
      const result = await uploadFromBuffer(file.buffer);

      updates.profilePicture = result.secure_url;
    }

    // 🔹 PHOTOS (multiple)
    if (req.files?.photos) {
      console.log("Uploading multiple photos...");

      const uploadedPhotos = [];

      for (const file of req.files.photos) {
        const result = await uploadFromBuffer(file.buffer);
        uploadedPhotos.push(result.secure_url);
      }

      // 👉 append + limit 5 (BEST PRACTICE)
      const user = await UserModel.findById(req.userId);

      updates.photos = [
        ...(user.photos || []),
        ...uploadedPhotos,
      ].slice(0, 5);
    }

    // ==========================
    // UPDATE USER
    // ==========================
    const user = await UserModel.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password -__v");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user,
    });

  } catch (error) {
    console.error("PATCH ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================
// PUT PROFILE (FULL REPLACE)
// ==========================
export const replaceUserProfile = async (req, res) => {
  try {
    const updates = {};

    editableFields.forEach((field) => {
      if (req.body[field] === undefined) return;

      let value = req.body[field];

      if (jsonFields.includes(field)) {
        try {
          value = JSON.parse(value);
        } catch {}
      }

      // fix subscriptions again
      if (field === "subscriptions" && !Array.isArray(value)) {
        value = [];
      }

      updates[field] = value;
    });

    const user = await UserModel.findByIdAndUpdate(
      req.userId,
      updates,
      {
        new: true,
        overwrite: true,
        runValidators: true
      }
    ).select("-password -__v");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile replaced successfully",
      user,
    });

  } catch (error) {
    console.error("PUT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};