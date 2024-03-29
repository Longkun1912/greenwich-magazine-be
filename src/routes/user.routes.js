const { authJwt } = require("../middleware");
const controller = require("../controllers/user.controller");
const verifyRegistration = require("../middleware/verifyRegistration");
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

  app.get(
    "/api/user-management/users",
    [authJwt.verifyToken, authJwt.isAdminOrManager],
    controller.viewUsers
  );

  app.post(
    "/api/user-management/user",
    [authJwt.verifyToken, authJwt.isAdmin],
    [
      verifyRegistration.checkDuplicateEmail,
      verifyRegistration.checkDuplicateMobile,
    ],
    upload.single("avatar_image"),
    controller.createUser
  );

  app.put(
    "/api/user-management/user",
    [authJwt.verifyToken, authJwt.isAdminOrManager],
    upload.single("avatar_image"),
    controller.editUser
  );

  app.delete(
    "/api/user-management/user/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.deleteUser
  );
};
