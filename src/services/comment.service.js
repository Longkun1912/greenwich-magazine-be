const Comment = require("../models/comment");
const Contribution = require('../models/contribution');
const moment = require('moment'); 

const commentService = {
  async createComment(commentForm, userID, contributionID) {
    try {
      const existingContribution = await Contribution.findById(contributionID);
      if (!existingContribution) {
        throw new Error("Contribution not found.");
      }
      const createdAt = existingContribution.createdAt;
    const daysSinceCreation = moment().diff(createdAt, 'days');
    if (daysSinceCreation > 14) {
      throw new Error("Cannot add comment. Contribution is older than 14 days.");
    }
      const existingCommentCount = await Comment.countDocuments({ contribution: contributionID });
    
      if (existingCommentCount > 0) {
        throw new Error("Contribution already has comment.");
      }
      const comment = new Comment({
        content: commentForm.content,
        coordinator: userID,
        contribution: contributionID,
      });
      const createdComment = await comment.save();
      return createdComment;
    } catch (error) {
      console.error("Error creating comment:", error);
      throw error;
    }
  },
  

  async getCommentByContribution(contributionID) {
    try {
      const comments = await Comment.find({ contribution: contributionID });
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

  async viewCommentsForStudent(userID, contributionID) {
    console.log(contributionID);
    console.log(userID);
    try {
      const contribution = await Contribution.findById(contributionID);
      if (!contribution) {
        throw new Error("Contribution not found.");
      }
  
      console.log(contribution.submitter);
      if (contribution.submitter.toString() !== userID) {
        throw new Error("You are not authorized to view comments for this contribution.");
      }
      const comments = await Comment.find({ contribution: contributionID });
      return comments;
    } catch (error) {
      console.error("Error fetching comments for student:", error);
      throw error;
    }
  }
  
};

module.exports = commentService;
