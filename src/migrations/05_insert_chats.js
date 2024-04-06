const mongoose = require("mongoose");
const Chat = require("../models/chat");
const User = require("../models/user");

module.exports = async function () {
  try {
    const users = await User.find();
    await Chat.create({
      user1: users.find((user) => user.email === "itcoordinator@fpt.edu.vn")
        ._id,
      user2: users.find((user) => user.email === "itstudent@fpt.edu.vn")._id,
    });
    console.log("Initial chats created successfully!");
  } catch (error) {
    console.error("Error creating chats:", error);
  }
};
