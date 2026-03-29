import ChatModel from "../models/Chat.js";
import UserModel from "../models/User.js";

// ==========================
// GET CHAT
// ==========================
export const getChat = async (req, res) => {
  try {
    const { receiverUsername } = req.query;

    if (!receiverUsername) {
      return res.status(400).json({
        message: "receiverUsername is required",
      });
    }

    const currentUser = await UserModel.findById(req.userId);

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const chat = await ChatModel.findOne({
      $or: [
        { user1: currentUser.username, user2: receiverUsername },
        { user1: receiverUsername, user2: currentUser.username },
      ],
    });

    if (!chat) {
      return res.status(200).json({ chats: [] }); // no chat yet
    }

    return res.status(200).json({ chats: chat.chats });

  } catch (error) {
    console.error("GET CHAT ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ==========================
// SEND MESSAGE
// ==========================
export const sendMessage = async (req, res) => {
  try {
    const { receiverUsername, message, image } = req.body;

    if (!receiverUsername) {
      return res.status(400).json({
        message: "receiverUsername is required",
      });
    }

    if (!message && !image) {
      return res.status(400).json({
        message: "Message or image required",
      });
    }

    const currentUser = await UserModel.findById(req.userId);

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    let chat = await ChatModel.findOne({
      $or: [
        { user1: currentUser.username, user2: receiverUsername },
        { user1: receiverUsername, user2: currentUser.username },
      ],
    });

    //  create chat if not exists
    if (!chat) {
      chat = new ChatModel({
        user1: currentUser.username,
        user2: receiverUsername,
        chats: [],
      });
    }

    //  push message
    chat.chats.push({
      sender: currentUser.username,
      message,
      image,
    });

    await chat.save();

    return res.status(200).json({
      message: "Message sent",
      chats: chat.chats,
    });

  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};