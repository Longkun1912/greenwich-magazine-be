const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const contributionSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    document: {
      type: String,
    },
    image: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "modified", "public"],
      default: "pending",
      required: true,
    },
    submitter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Contribution", contributionSchema);
