const Chat = require("../models/chat");
const Message = require("../models/message");
const User = require("../models/user");

const MessageService = {
  async createMessage(chatId, sender, content) {
    try {
      const chat = await Chat.findById(chatId);
      const message = await Message.create({ chat: chat, sender, content });
      return message;
    } catch (error) {
      throw new Error(error);
    }
  },

  async getMessages(chatId) {
    try {
      const messages = await Message.find({ chat: chatId }).sort({
        createdAt: 1,
      });
      return Promise.all(
        messages.map(async (message) => {
          const sender = await User.findById(message.sender);

          return {
            id: message._id,
            chat: message.chat,
            sender: sender,
            content: message.content,
            updatedAt: message.updatedAt,
          };
        })
      );
    } catch (error) {
      throw new Error(error);
    }
  },

  async updateMessage(messageId, content) {
    try {
      const message = await Message.findById(messageId);
      if (!message) {
        throw new Error("Message not found");
      }

      message.content = content;
      message.updatedAt = new Date();
      return await message.save();
    } catch (error) {
      throw new Error(error);
    }
  },

  async deleteMessage(messageId) {
    try {
      const message = await Message.findById(messageId);
      if (!message) {
        throw new Error("Message not found");
      }
      return await message.deleteOne({ _id: messageId });
    } catch (error) {
      throw new Error(error);
    }
  },
};

module.exports = MessageService;
