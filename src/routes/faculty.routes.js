// hhhmmm
const Controller = require("../controllers/faculty.controller");
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

  // API xem tất cả faculty
  app.get("/api/faculty", Controller.getAllFaculties);

  // API create faculty
  app.post(
    "/api/faculty/create",
    upload.single("image"),
    Controller.createFaculty
  );

  // API update faculty
  app.put(
    "/api/faculty/update/:id",
    upload.single("image"),
    Controller.updateFaculty
  );

  // API delete faculty
  app.delete("/api/faculty/delete/:id", Controller.deleteFaculty);
};
