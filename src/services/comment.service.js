const Comment = require("../models/comment");

const commentService = {
  async createComment(commentForm, userID, contributionID) {
    try {
      const comment = new Comment({
        content: commentForm.content,
        submitter: userID,
        contribution: contributionID,
      });
      const createdComment = await comment.save();
      return createdComment;
    } catch (error) {
      console.error("Error creating comment:", error);
      throw error;
    }
  },

  async getAllComments() {
    try {
      return await Comment.find();
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
};

module.exports = commentService;
