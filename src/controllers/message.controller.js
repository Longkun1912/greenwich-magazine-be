const MessageService = require("../services/message.service");

exports.createMessage = async (req, res) => {
  try {
    const message = await MessageService.createMessage(
      req.params.chatId,
      req.body.sender,
      req.body.content
    );
    res.status(200).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await MessageService.getMessages(req.params.chatId);
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateMessage = async (req, res) => {
  try {
    const message = await MessageService.updateMessage(
      req.params.messageId,
      req.body.content
    );
    res.status(200).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    await MessageService.deleteMessage(req.params.messageId);
    res.status(200).send("Message deleted successfully.");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
