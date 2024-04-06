const mongoose = require("mongoose");
const Contribution = require("./contribution");
const Chat = require("./chat");
const googleDriveService = require("../services/google-drive.service");
const cloudinaryService = require("../services/cloudinary.service");

const userSchema = new mongoose.Schema(
  {
    avatar: {
      type: String,
      default:
        "https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1677509740.jpg",
    },
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    mobile: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      console.log("Deleting user with ID: " + this._id);

      // Delete all contributions created by this user
      const contributions = await Contribution.find({ submitter: this._id });
      console.log("Contribution size: " + contributions.length);
      for (const contribution of contributions) {
        // Delete contribution image and document
        if (contribution.image) {
          console.log("Deleting image...");
          await cloudinaryService.deleteUserImageFromCloudinary(
            contribution.title
          );
        }
        if (contribution.document) {
          console.log("Deleting document...");
          const authClient = await googleDriveService.authorizeGoogleDrive();
          await googleDriveService.deleteFileFromGoogleDrive(
            authClient,
            contribution.document
          );
        }
        await contribution.deleteOne();
        console.log("Contribution created by user has been deleted.");

        // Delete chats associated with this user
        const chats = await Chat.find({
          $or: [{ user1: this._id }, { user2: this._id }],
        });
        console.log("Chat size: " + chats.length);

        for (const chat of chats) {
          await chat.deleteOne({ _id: chat._id });
        }
        console.log("Chats associated with user have been deleted.");
      }
      next();
    } catch (error) {
      next(error);
    }
  }
);

module.exports = mongoose.model("User", userSchema);
