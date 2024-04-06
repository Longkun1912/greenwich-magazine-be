const Chat = require("../models/chat");
const Message = require("../models/message");

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
      return messages;
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
