const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const cloudinaryService = require("../services/cloudinary.service");
const googleDriveService = require("../services/google-drive.service");
const Comment = require("./comment");

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
      enum: ["pending", "approved", "rejected", "modified"],
      default: "pending",
      required: true,
    },
    state: {
      type: String,
      enum: ["private", "public"],
      default: "public",
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
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

contributionSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      console.log("Deleting contribution with ID: " + this._id);

      // Delete contribution image and document
      if (this.image) {
        console.log("Deleting contribution image...");
        await cloudinaryService.deleteUserImageFromCloudinary(this.title);
      }
      if (this.document) {
        console.log("Deleting contribution document...");
        const authClient = await googleDriveService.authorizeGoogleDrive();
        await googleDriveService.deleteFileFromGoogleDrive(
          authClient,
          this.document
        );
      }

      // Delete comment that belongs to this contribution
      const singleFeedback = await Comment.findOne({ contribution: this._id });
      if (singleFeedback) {
        await singleFeedback.deleteOne();
      }
      console.log(
        "Deleted comment that belongs to this contribution successfully."
      );
      next();
    } catch (error) {
      next(error);
    }
  }
);

module.exports = mongoose.model("Contribution", contributionSchema);
