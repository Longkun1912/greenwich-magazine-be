const ChatService = require("../services/chat.service");
const MessageService = require("../services/message.service");

// Chat management
exports.createChat = async (req, res) => {
  try {
    const { user1Id, user2Id } = req.query; // Accessing query parameters
    const chat = await ChatService.createChat(user1Id, user2Id);
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStudentsInFacultyForChat = async (req, res) => {
  try {
    const { currentUserId } = req.params; // Accessing route parameters
    const students = await ChatService.getStudentsInFacultyForChat(
      currentUserId
    );
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Message management
exports.createMessage = async (req, res) => {
  try {
    const { chatId, sender, content } = req.body; // Accessing request body
    const message = await MessageService.createMessage(chatId, sender, content);
    res.status(200).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params; // Accessing route parameters
    const messages = await MessageService.getMessages(chatId);
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateMessage = async (req, res) => {
  try {
    const { messageId } = req.params; // Accessing route parameters
    const { content } = req.body; // Accessing request body
    const message = await MessageService.updateMessage(messageId, content);
    res.status(200).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params; // Accessing route parameters
    await MessageService.deleteMessage(messageId);
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
