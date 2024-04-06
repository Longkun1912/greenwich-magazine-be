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

  app.post(
    "/api/chat-management/chat",
    [authJwt.verifyToken],
    controller.createChat
  );

  app.get(
    "/api/chat-management/chats/:userId",
    [authJwt.verifyToken],
    controller.getCurrentChats
  );

  app.delete(
    "/api/chat-management/chat/:chatId",
    [authJwt.verifyToken],
    controller.deleteChat
  );
};
