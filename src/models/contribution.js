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
    documents: {
      type: [String],
    },
    images: {
      type: [String],
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
      // Delete contribution image and document
      console.log("Deleting contribution image...");
      for (const image of this.images) {
        await cloudinaryService.deleteContributionImageFromCloudinary(image);
      }
      console.log("Deleted contribution image successfully.");
      console.log("Deleting contribution document...");
      const authClient = await googleDriveService.authorizeGoogleDrive();
      for (const document of this.documents) {
        await googleDriveService.deleteFileFromGoogleDrive(
          authClient,
          document
        );
      }
      console.log("Deleted contribution document successfully.");

      // Delete comments of the contribution
      console.log("Deleting comments of the contribution...");
      await Comment.deleteMany({ contribution: this._id });
      console.log("Deleted comments of the contribution successfully.");
      next();
    } catch (error) {
      next(error);
    }
  }
);

module.exports = mongoose.model("Contribution", contributionSchema);
