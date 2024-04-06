const Chat = require("../models/chat");
const User = require("../models/user");

const ChatService = {
  async createChat(user1Id, user2Id) {
    try {
      const user1 = await User.findById(user1Id);
      const user2 = await User.findById(user2Id);

      if (!user1 || !user2) {
        throw new Error("User not found");
      }

      const chat = await Chat.create({ user1, user2 });
      return chat;
    } catch (error) {
      throw new Error(error);
    }
  },

  async getCurrentChats(userId) {
    try {
      const chats = await Chat.find({
        $or: [{ user1: userId }, { user2: userId }],
      })
        .populate("user1")
        .populate("user2")
        .sort({ updatedAt: -1 });
      return chats.map((chat) => {
        // Return chats and the latest message in each chat
        const latestMessage = chat.messages[0].content;
        return {
          _id: chat._id,
          user1: chat.user1,
          user2: chat.user2,
          latestMessage,
          updatedAt: chat.updatedAt,
        };
      });
    } catch (error) {
      throw new Error(error);
    }
  },

  async deleteChat(chatId) {
    try {
      const chat = await Chat.findById(chatId);
      if (!chat) {
        throw new Error("Chat not found");
      }
      chat._id = chatId;
      return await chat.deleteOne({ _id: chatId });
    } catch (error) {
      throw new Error(error);
    }
  },
};

module.exports = ChatService;
