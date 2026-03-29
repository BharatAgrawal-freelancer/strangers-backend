import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    user1: { type: String, required: true },
    user2: { type: String, required: true },

    chats: [
      {
        sender: { type: String, required: true },
        message: { type: String },
        image: { type: String },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const ChatModel =
  mongoose.models.Chat || mongoose.model("Chat", chatSchema);

export default ChatModel;