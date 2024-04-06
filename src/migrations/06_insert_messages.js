const mongoose = require("mongoose");
const Message = require("../models/message");
const Chat = require("../models/chat");

module.exports = async function () {
  try {
    const chats = await Chat.find();
    const messages = [
      {
        chat: chats[0]._id,
        sender: chats[0].user1,
        content: "Hello!",
      },
      {
        chat: chats[0]._id,
        sender: chats[0].user2,
        content: "Hi!",
      },
    ];
    await Message.create(messages);
    console.log("Initial messages created successfully!");
  } catch (error) {
    console.error("Error creating messages:", error);
  }
};
