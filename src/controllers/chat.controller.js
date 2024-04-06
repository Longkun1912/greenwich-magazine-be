const ChatService = require("../services/chat.service");

exports.createChat = async (req, res) => {
  try {
    const { user1Id, user2Id } = req.query; // Accessing query parameters
    const chat = await ChatService.createChat(user1Id, user2Id);
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCurrentChats = async (req, res) => {
  try {
    const chats = await ChatService.getCurrentChats(req.params.userId);
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteChat = async (req, res) => {
  try {
    await ChatService.deleteChat(req.params.chatId);
    res.status(200).send("Chat deleted successfully.");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
