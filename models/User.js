import mongoose from "mongoose";

const { Schema, models, model } = mongoose;

//  Subscription Schema
const subscriptionSchema = new Schema({
  subscriptionName: { type: String,  trim: true },
  subscriptionTime: { type: Date, default: Date.now },
  amount: { type: Number},
});

//  User Schema
const userSchema = new Schema(
  {
     provider: {
    type: String,
    enum: ["google", "form"],
  },

  providerId: {
    type: String,
  },
   isverified: {
    type: Boolean,
    default: false,
  },
    username: { type: String},
    name: { type: String},
    mobile: { type: String },
    password: { type: String },
    profilePicture: { type: String },
    email: { type: String, required: true, unique: true },

    gender: { type: String, enum: ["man", "woman", "lgbtq+"] },

    location: {
      country: String,
      state: String,
      pincode: String,
    },

    bio: String,
    hobbies: [String],
    interests: [String],
    work: String,
    education: String,
    universityOrSchool: String,

    questions: { type: Map, of: String },

    alcoholic: Boolean,
    smoking: Boolean,

    personality: { type: String, enum: ["introvert", "extrovert"] },
    relationTime: { type: String, enum: ["long term", "short term", "casual"] },

    spam: { type: Boolean, default: false },
    faceVerification: { type: Boolean, default: false },

    photos: {
      type: [String],
      validate: [(val) => val.length <= 5, "Maximum 5 photos allowed"],
    },

    relationshipGoals: String,
    familyPlan: String,
    height: String,
    weight: String,

    subscriptions: [subscriptionSchema],

    socialMediaLinks: {
      Instagram: String,
      Spotify: String,
      Facebook: String,
    },

    coins: { type: Number, default: 0 },

    oldMatches: [String],
    superLikeCount: { type: Number, default: 0 },
    profileCount: { type: Number, default: 0 },
    likeCount: { type: Number, default: 0 },
    numberOfMatches: { type: Number, default: 0 },

    blindDate: { type: Boolean, default: false },

    blacklist: [String],
    couponCodesUsed: [String],
    couponCodePercentRemission: [Number],

    likeArray: { type: [String], default: [] },
    matchArray: { type: [String], default: [] },
  },
  {
    timestamps: true, //  added (createdAt, updatedAt)
  }
);

//  Prevent model overwrite (important for Vercel)
const UserModel = models.User || model("User", userSchema);

export default UserModel;