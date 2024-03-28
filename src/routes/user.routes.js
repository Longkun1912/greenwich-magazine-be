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

  // All roles
  app.get("/api/test/all", controller.allAccess);

  // Admin only
  app.get(
    "/api/test/admin",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.adminBoard
  );

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

  // Manager only
  app.get(
    "/api/test/manager",
    [authJwt.verifyToken, authJwt.isManager],
    controller.managerBoard
  );

  // Coordinator only
  app.get(
    "/api/test/coordinator",
    [authJwt.verifyToken, authJwt.isCoordinator],
    controller.coordinatorBoard
  );

  // Student only
  app.get(
    "/api/test/student",
    [authJwt.verifyToken, authJwt.isStudent],
    controller.studentBoard
  );

  // Guest only
  app.get(
    "/api/test/guest",
    [authJwt.verifyToken, authJwt.isGuest],
    controller.guestBoard
  );
};
