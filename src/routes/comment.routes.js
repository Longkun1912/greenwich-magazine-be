const commentController = require("../controllers/comment.controller");
const { authJwt } = require("../middleware");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Define routes for handling comments
  app.post(
    "/api/comment-management/comment/:idContribution",
    [authJwt.verifyToken, authJwt.isCoordinator],
    commentController.createComment
  ); 
  app.get(
    "/api/comment-management/comment/:idContribution",
    [authJwt.verifyToken, authJwt.isCoordinator],
    commentController.getCommentByContribution
  ); 
  app.put(
    "/api/comment-management/comment/:id",
    [authJwt.verifyToken, authJwt.isCoordinator],
    commentController.updateComment
  ); 
  app.delete(
    "/api/comment-management/comments/:id",
    [authJwt.verifyToken, authJwt.isCoordinator],
    commentController.deleteComment
  ); 

  app.get(
    "/api/student/comment",
    [authJwt.verifyToken, authJwt.isStudent],
    async (req, res) => {
      try {
        const { idUser, idContribution } = req.query;
        await commentController.viewCommentsForStudent(res, req,idUser, idContribution);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
  );
  
};
