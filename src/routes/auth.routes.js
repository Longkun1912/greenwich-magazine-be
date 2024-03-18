const { verifyRegistration } = require("../middleware");
const controller = require("../controllers/auth.controller");
const multer = require("multer");

const upload = multer();

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/auth/register",
    [
      verifyRegistration.checkDuplicateEmail,
      verifyRegistration.checkDuplicateMobile,
    ],
    upload.single("avatar_image"),
    controller.register
  );

  app.post("/api/auth/login", controller.login);

  app.post("/api/auth/logout", controller.logout);
};
