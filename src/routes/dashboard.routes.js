const controller = require("../controllers/dashboard.controller");
const { authJwt } = require("../middleware");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/api/dashboard/contributions",
    [authJwt.verifyToken, authJwt.isManager],
    controller.viewNumberOfContributionsDashboard
  );

  app.get(
    "/api/dashboard/faculties/contributions",
    [authJwt.verifyToken, authJwt.isManager],
    controller.viewPercentageOfContributionsInFacultiesDashboard
  );

  app.get(
    "/api/dashboard/faculties/contributors",
    [authJwt.verifyToken, authJwt.isManager],
    controller.viewNumberOfContributorsInEachFacultyDashboard
  );
};
