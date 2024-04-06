const { authJwt } = require("../middleware");
const controller = require("../controllers/chat.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Chat management
  app.post(
    "/api/chat-management/chat",
    [authJwt.verifyToken, authJwt.isCoordinatorOrStudent],
    controller.createChat
  );

  app.get(
    "/api/chat-management/students/:currentUserId",
    [authJwt.verifyToken, authJwt.isCoordinatorOrStudent],
    controller.getStudentsInFacultyForChat
  );

  // Message management
  app.post(
    "/api/chat-management/message",
    [authJwt.verifyToken, authJwt.isCoordinatorOrStudent],
    controller.createMessage
  );

  app.get(
    "/api/chat-management/messages/:chatId",
    [authJwt.verifyToken, authJwt.isCoordinatorOrStudent],
    controller.getMessages
  );

  app.put(
    "/api/chat-management/message/:messageId",
    [authJwt.verifyToken, authJwt.isCoordinatorOrStudent],
    controller.updateMessage
  );

  app.delete(
    "/api/chat-management/message/:messageId",
    [authJwt.verifyToken, authJwt.isCoordinatorOrStudent],
    controller.deleteMessage
  );
};
