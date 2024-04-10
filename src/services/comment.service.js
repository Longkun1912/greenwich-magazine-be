const mongoose = require("mongoose");
const Comment = require("../models/comment");
const User = require("../models/user");
const Contribution = require("../models/contribution");
const moment = require("moment");

const commentService = {
  async createComment(commentForm, userID, contributionID) {
    try {
      const existingContribution = await Contribution.findById(contributionID);
      if (!existingContribution) {
        throw new Error("Contribution not found.");
      }

      const createdAt = existingContribution.createdAt;
      const daysSinceCreation = moment().diff(createdAt, "days");
      if (daysSinceCreation > 14) {
        throw new Error(
          "Cannot add comment. Contribution is older than 14 days."
        );
      }

      // Check whether this contribution already has a comment from the coordinator or not
      const existingComment = await Comment.findOne({
        contribution: existingContribution._id,
      });
      if (existingComment) {
        throw new Error("Contribution already has a comment.");
      }

      console.log("User ID: " + userID);

      const coordinator = await User.findById(userID);
      if (!coordinator) {
        throw new Error("Coordinator not found.");
      }

      const comment = new Comment({
        content: commentForm.content,
        coordinator: coordinator._id,
        contribution: existingContribution._id,
      });
      return await comment.save();
    } catch (error) {
      console.error("Error creating comment:", error);
      throw error;
    }
  },

  async getCommentByContribution(contributionID) {
    try {
      const contribution = await Contribution.findById(contributionID);
      if (!contribution) {
        throw new Error("Contribution not found.");
      }
      const comments = await Comment.find({ contribution: contribution._id });
      return comments;
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw error;
    }
  },

  async updateComment(id, commentDetails) {
    try {
      const comment = await Comment.findById(id);
      if (!comment) {
        throw new Error("Comment not found");
      }
      if (commentDetails.content) {
        comment.content = commentDetails.content;
      }

      const updatedComment = await comment.save();
      return updatedComment;
    } catch (error) {
      console.error("Error updating comment:", error);
      throw error;
    }
  },

  async deleteComment(id) {
    try {
      const deletedComment = await Comment.findByIdAndDelete(id);
      if (!deletedComment) {
        throw new Error("Comment not found");
      }
      return { message: "Successfully deleted comment" };
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  },

  async viewCommentsForStudent(contributionID) {
    try {
      const contribution = await Contribution.findById(contributionID);
      if (!contribution) {
        throw new Error("Contribution not found.");
      }
      const comments = await Comment.find({ contribution: contribution._id });
      return comments;
    } catch (error) {
      console.error("Error fetching comments for student:", error);
      throw error;
    }
  },
};

module.exports = commentService;
