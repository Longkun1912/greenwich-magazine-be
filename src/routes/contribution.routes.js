const { authJwt } = require("../middleware");
const controller = require("../controllers/contribution.controller");
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
    "/api/contribution-management/contribution",
    controller.getAllContributions
  );

  app.post(
    "/api/contribution-management/contribution",
    [authJwt.verifyToken, authJwt.isStudent],
    upload.fields([
      { name: "imageFile", maxCount: 1 },
      { name: "documentFile", maxCount: 1 },
    ]),
    controller.createContribution
  );

  app.put(
    "/api/contribution-management/contribution/:id",
    [authJwt.verifyToken, authJwt.isStudent],
    controller.updateContribution
  );

  app.delete(
    "/api/contribution-management/contribution/:id",
    [authJwt.verifyToken, authJwt.isStudent],
    controller.deleteContribution
  );
};
