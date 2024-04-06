const { authJwt } = require("../middleware");
const controller = require("../controllers/message.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/message-management/message/:chatId",
    [authJwt.verifyToken],
    controller.createMessage
  );

  app.get(
    "/api/message-management/messages/:chatId",
    [authJwt.verifyToken],
    controller.getMessages
  );

  app.put(
    "/api/message-management/message/:messageId",
    [authJwt.verifyToken],
    controller.updateMessage
  );

  app.delete(
    "/api/message-management/message/:messageId",
    [authJwt.verifyToken],
    controller.deleteMessage
  );
};
