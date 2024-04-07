const commentService = require("../services/comment.service");

const commentController = {
    async createComment(req, res) {
        try {
          const commentForm = req.body;
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

  async getCommentByContribution(req, res) {
    try {
      const comment = await commentService.getCommentByContribution(req.params.idContribution);
      res.status(200).json(comment);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateComment(req, res) {
    try {
      const commentId = req.params.id; 
      const commentDetails = req.body; 
      const updatedComment = await commentService.updateComment(commentId, commentDetails);
      res.status(200).json(updatedComment);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async deleteComment(req, res) {
    try {
      const commentId = req.params.id; 
      const result = await commentService.deleteComment(commentId);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async viewCommentsForStudent(res, req, idUser, idContribution) {
    try {
      const comment = await commentService.viewCommentsForStudent(idUser, idContribution);
      res.json(comment);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = commentController;
