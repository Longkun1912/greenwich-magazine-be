const eventController = require("../controllers/event.controller");
const { authJwt } = require("../middleware");

module.exports = function (app) {
    app.use(function (req, res, next) {
      res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    });

// Define routes for handling events
app.post("/api/event-management/events", [authJwt.verifyToken, authJwt.isAdmin], eventController.createEvent); // Route for creating a new event, accessible only to admins
app.get("/api/event-management/events", [authJwt.verifyToken, authJwt.isAdmin], eventController.getAllEvents); // Route for getting all events, accessible to all authenticated users
app.put("/api/event-management/events/:id", [authJwt.verifyToken, authJwt.isAdmin], eventController.updateEvent); // Route for updating an event, accessible only to admins
app.delete("/api/event-management/events/:id", [authJwt.verifyToken, authJwt.isAdmin], eventController.deleteEvent); // Route for deleting an event, accessible only to admins

}
