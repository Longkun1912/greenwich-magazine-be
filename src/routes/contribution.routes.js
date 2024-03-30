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
    [authJwt.verifyToken, authJwt.isAdminOrManager],
    controller.getAllContributions
  );

  app.get(
    "/api/contribution-management/contribution/:id", 
    [authJwt.verifyToken, authJwt.isManager],
    controller.getContributionDetails
  );

  app.post(
    "/api/contribution-management/contribution",
    [authJwt.verifyToken, authJwt.isAdmin],
    upload.fields([
      { name: "image", maxCount: 1 },
      { name: "document", maxCount: 1 },
    ]),
    controller.createContribution
  );

  app.put(
    "/api/contribution-management/contribution",
    [authJwt.verifyToken, authJwt.isAdmin],
    upload.fields([
      { name: "image", maxCount: 1 },
      { name: "document", maxCount: 1 },
    ]),
    controller.updateContribution
  );

  app.delete(
    "/api/contribution-management/contribution/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.deleteContribution
  );

  // Guest
  app.get('/api/guest/contribution',
  [authJwt.verifyToken, authJwt.isGuest],
  controller.getPublicContributions);

  // Student
  app.get("/api/student/:facultyId",
    [authJwt.verifyToken, authJwt.isStudent],
    controller.viewAllContributionbyFaculty
  ); 

   app.post("/api/student/contribution/:idEvent", 
   [authJwt.verifyToken, authJwt.isStudent],
       upload.fields([
      { name: "image", maxCount: 1 },
      { name: "document", maxCount: 1 },
    ]),
  controller.createContributionForStudent);

  app.put("/api/student/contribution", 
  [authJwt.verifyToken, authJwt.isStudent],
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "document", maxCount: 1 },
  ]),
  controller.updateContributionForStudent);

  app.delete("/api/student/contribution/:id",
  [authJwt.verifyToken, authJwt.isStudent],
  controller.deleteContributionForStudent);
  
  // Marketing Coordinator
  app.put("/api/coordinator/contribution",
  [authJwt.verifyToken, authJwt.isCoordinator],
  controller.changeContributionStatus);
};