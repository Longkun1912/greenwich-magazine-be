const commentService = require("../services/comment.service");

const commentController = {
    async createComment(req, res) {
        try {
          const commentForm = req.body; // Assuming comment details are sent in the request body
          const userId = req.userId;
          const contributionId = req.params.idContribution;
          if (!commentForm.content || !userId || !contributionId) {
            return res.status(400).json({ message: "Missing required fields!" });
          }
          const createdComment = await commentService.createComment(commentForm, userId, contributionId);
          res.status(201).json(createdComment);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      },    

  async getAllComments(req, res) {
    try {
      const comments = await commentService.getAllComments();
      res.status(200).json(comments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateComment(req, res) {
    try {
      const commentId = req.params.id; // Assuming the comment ID is passed as a route parameter
      const commentDetails = req.body; // Assumed that updated comment details are sent in the request body
      const updatedComment = await commentService.updateComment(commentId, commentDetails);
      res.status(200).json(updatedComment);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async deleteComment(req, res) {
    try {
      const commentId = req.params.id; // Assuming the comment ID is passed as a route parameter
      const result = await commentService.deleteComment(commentId);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = commentController;
