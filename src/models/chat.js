const mongoose = require("mongoose");
const Message = require("./message");

const chatSchema = new mongoose.Schema(
  {
    user1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    user2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

chatSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      console.log("Deleting chat with ID: " + this._id);
      const messages = await Message.find({ chat: this._id });
      for (const message of messages) {
        await message.deleteOne();
      }
      console.log("Chat messages have been deleted.");
      next();
    } catch (error) {
      next(error);
    }
  }
);

module.exports = mongoose.model("Chat", chatSchema);
